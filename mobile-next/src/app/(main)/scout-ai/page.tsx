'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { IntentChips } from '@/components/scout/IntentChips';
import { MicButton } from '@/components/scout/MicButton';
import { api, type AskAIResponse, type Post } from '@/lib/api';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';

type Turn =
  | { role: 'user'; text: string }
  | { role: 'scout'; text: string; suggestions?: string[]; relatedArticles?: Post[] };

const DEFAULT_PROMPTS = [
  'How are the Bears looking?',
  'Who scored last night for the Bulls?',
  'Summarize today’s top story',
  'What time is the Cubs game?',
];

export default function ScoutAI() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, loading]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    haptic('light');
    setTurns((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const r: AskAIResponse = await api.askAI(trimmed);
      setTurns((prev) => [
        ...prev,
        {
          role: 'scout',
          text: r.response,
          suggestions: r.suggestions,
          relatedArticles: r.relatedArticles,
        },
      ]);
    } catch (e) {
      setTurns((prev) => [
        ...prev,
        { role: 'scout', text: 'Hit a snag reaching Scout. Try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const lastSuggestions =
    turns.length === 0
      ? DEFAULT_PROMPTS
      : (turns[turns.length - 1] as Extract<Turn, { role: 'scout' }>).role === 'scout'
      ? (turns[turns.length - 1] as Extract<Turn, { role: 'scout' }>).suggestions ?? []
      : [];

  return (
    <main className="flex flex-col min-h-dvh">
      <header className="px-5 pt-8 pb-3 safe-top">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold flex items-center gap-1.5">
          <Sparkles size={12} /> Scout AI
        </div>
        <h1 className="mt-1 text-display font-bold text-white">Ask anything Chicago.</h1>
      </header>

      <div ref={scrollRef} className="flex-1 px-4 pb-32 space-y-3 overflow-y-auto">
        {turns.length === 0 && (
          <p className="text-sm text-white/60 text-center mt-8">
            Try a quick one — Scout knows scores, lineups, news, and more.
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={cn('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                t.role === 'user' ? 'bg-brand-red text-white' : 'liquid-glass-dark text-white/90',
              )}
            >
              {t.text}
              {t.role === 'scout' && t.relatedArticles && t.relatedArticles.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {t.relatedArticles.slice(0, 3).map((a) => (
                    <Link
                      key={a.id}
                      href={`/article/view?id=${a.id}`}
                      className="block rounded-lg bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10"
                    >
                      → {a.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <LiquidGlassCard className="max-w-[60%] inline-block">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse [animation-delay:120ms]" />
              <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse [animation-delay:240ms]" />
            </div>
          </LiquidGlassCard>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="fixed left-3 right-3 bottom-[calc(80px+env(safe-area-inset-bottom))] liquid-glass-pill px-3 py-2 flex flex-col gap-2"
      >
        {lastSuggestions.length > 0 && (
          <IntentChips
            suggestions={lastSuggestions}
            onPick={(s) => ask(s)}
            className="px-1"
          />
        )}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Scout…"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
          />
          <MicButton
            onTranscript={(t) => setInput(t)}
            onSubmit={(t) => ask(t)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="h-11 w-11 rounded-full bg-brand-red text-white grid place-items-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </main>
  );
}
