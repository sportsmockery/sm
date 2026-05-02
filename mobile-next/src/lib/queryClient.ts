/**
 * Web build of mobile/lib/queryClient.ts. The QueryClient instance is owned
 * by providers.tsx; this file is kept so anything that imports
 * `createQueryClient` from this path keeps working.
 */

import { QueryClient } from '@tanstack/react-query';
import { CACHE_DURATIONS, STALE_TIMES } from './config';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIMES.feed,
        gcTime: CACHE_DURATIONS.feed,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
