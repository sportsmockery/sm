'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/AuthProvider';
import { GMProvider } from '@/lib/gm-context';
import { MockDraftProvider } from '@/lib/mock-draft-context';
import { isNative } from '@/lib/utils';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (!isNative()) return;
    let cancelled = false;

    (async () => {
      try {
        const [{ App }, { StatusBar, Style }] = await Promise.all([
          import('@capacitor/app'),
          import('@capacitor/status-bar'),
        ]);
        if (cancelled) return;

        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

        App.addListener('appUrlOpen', async (event) => {
          if (!event?.url) return;
          if (event.url.startsWith('sportsmockery://auth/callback')) {
            const url = new URL(event.url.replace('sportsmockery://', 'https://app.local/'));
            const code = url.searchParams.get('code');
            if (code) {
              const { supabase } = await import('@/lib/supabase');
              await supabase.auth.exchangeCodeForSession(code);
            }
          }
        });
      } catch {
        /* noop */
      }
    })();

    (async () => {
      try {
        const { initPush } = await import('@/lib/push');
        await initPush();
      } catch { /* noop */ }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <GMProvider>
          <MockDraftProvider>{children}</MockDraftProvider>
        </GMProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
