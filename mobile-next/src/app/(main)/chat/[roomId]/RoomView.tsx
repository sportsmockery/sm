'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { api, type ChatMessage } from '@/lib/api';
import { subscribeToChatRoom } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export function RoomView() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    api.getChatMessages(roomId, { limit: 50 }).then((r) => {
      if (!cancelled) setMessages(r.messages.slice().reverse());
    }).catch(() => { if (!cancelled) setMessages([]); });

    const unsub = subscribeToChatRoom(roomId, (m) => {
      setMessages((prev) => prev ? [...prev, m as unknown as ChatMessage] : [m as unknown as ChatMessage]);
    });

    return () => { cancelled = true; unsub(); };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending || !roomId) return;
    setSending(true);
    try {
      await api.sendChatMessage(roomId, text.trim());
      setText('');
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex flex-col min-h-dvh">
      <div className="flex items-center gap-3 px-4 py-3 safe-top liquid-glass-dark border-b border-white/5">
        <Link href="/chat" aria-label="Back" className="text-white/80">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <div className="text-sm font-semibold text-white">{roomId}</div>
          <div className="text-[11px] text-white/50">Live</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-2">
        {!messages ? (
          <>
            <Skeleton className="h-10 w-2/3" rounded="xl" />
            <Skeleton className="h-10 w-1/2 ml-auto" rounded="xl" />
            <Skeleton className="h-10 w-3/4" rounded="xl" />
          </>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-white/40 mt-10">No messages yet. Be first.</p>
        ) : (
          messages.map((m) => {
            const mine = user && m.user_id === user.id;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-3 py-2 text-sm',
                    mine ? 'bg-brand-red text-white' : 'bg-white/8 text-white/90 border border-white/10',
                  )}
                >
                  {!mine && (
                    <div className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                      {m.user?.username ?? 'fan'}
                    </div>
                  )}
                  <div>{m.content}</div>
                  <div className="text-[10px] opacity-60 mt-1">{formatRelativeTime(m.created_at)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={send}
        className="fixed left-3 right-3 bottom-[calc(80px+env(safe-area-inset-bottom))] liquid-glass-pill px-2 py-2 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? 'Say something…' : 'Sign in to chat'}
          disabled={!user}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
        />
        <button
          type="submit"
          disabled={!user || sending}
          aria-label="Send"
          className="h-9 w-9 rounded-full bg-brand-red text-white grid place-items-center disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </main>
  );
}
