'use client';

import { useEffect } from 'react';

export function useCardReveal(dep?: unknown) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1,
      }
    );

    document.querySelectorAll('.feed-card:not(.visible)').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [dep]);
}
