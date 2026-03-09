'use client';

import React, { useEffect, useState } from 'react';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 h-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <div
        className="h-full transition-transform duration-100"
        style={{
          backgroundColor: '#00D4FF',
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
