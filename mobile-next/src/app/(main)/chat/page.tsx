import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { TEAMS } from '@/lib/config';

export default function ChatHubPage() {
  const order: (keyof typeof TEAMS)[] = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Fan Chat</p>
        <h1 className="text-display font-bold text-white">Pick your room</h1>
      </header>

      <div className="space-y-3">
        <Link href="/chat/lounge">
          <LiquidGlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-red grid place-items-center text-white font-bold">
              C
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Chicago Lounge</div>
              <div className="text-xs text-white/60">All-team general chat.</div>
            </div>
          </LiquidGlassCard>
        </Link>

        {order.map((id) => {
          const t = TEAMS[id];
          return (
            <Link key={id} href={`/chat/${id}`}>
              <LiquidGlassCard className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.logo} alt="" className="h-12 w-12 object-contain" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{t.chatRoomName}</div>
                  <div className="text-xs text-white/60">w/ {t.aiPersonality}</div>
                </div>
              </LiquidGlassCard>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
