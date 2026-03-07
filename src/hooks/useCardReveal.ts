'use client';

import { useEffect } from 'react';

export function useCardReveal(dep?: unknown) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // one-time, CPU-friendly
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );

    document.querySelectorAll('.feed-card').forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [dep]); // re-run when feed updates (e.g. riverCards.length) so new cards get observed
}
