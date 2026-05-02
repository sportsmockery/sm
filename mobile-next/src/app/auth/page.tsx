'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Apple, Mail } from 'lucide-react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useAuth } from '@/hooks/useAuth';
import { signInWithOAuth } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error } = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
      if (error) setError(error.message);
      else router.replace('/');
    });
  }

  async function appleSignIn() {
    setError(null);
    const { error } = await signInWithOAuth('apple');
    if (error) setError(error.message);
  }

  return (
    <main className="min-h-dvh grid place-items-center px-5 py-10 safe-top safe-bottom">
      <LiquidGlassCard className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Chicago sports intelligence.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="sr-only">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-brand-red"
            />
          </label>
          <label className="block">
            <span className="sr-only">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-brand-red"
            />
          </label>

          {error && <p className="text-xs text-grade-red" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand-red text-white font-semibold py-3 text-sm disabled:opacity-50"
          >
            <Mail size={14} className="inline mr-1.5 -mt-0.5" />
            {pending ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={appleSignIn}
          className="mt-3 w-full rounded-xl bg-white text-black font-semibold py-3 text-sm flex items-center justify-center gap-2"
        >
          <Apple size={14} /> Continue with Apple
        </button>

        <button
          type="button"
          onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
          className="mt-4 w-full text-xs text-white/60 hover:text-white"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </LiquidGlassCard>
    </main>
  );
}
