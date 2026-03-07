'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function ScoutGreeting() {
  const { user, isAuthenticated } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const [animDone, setAnimDone] = useState(false);
  const animRef = useRef(false);

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const userName =
    isAuthenticated && user?.name
      ? user.name.split(' ')[0]
      : isAuthenticated && user?.email
        ? user.email.split('@')[0]
        : null;

  const fullText = userName
    ? `${timeGreeting}, ${userName}. Here's your Chicago sports briefing.`
    : `${timeGreeting}. Here's what Chicago fans need to know right now.`;

  useEffect(() => {
    if (animRef.current) return;
    animRef.current = true;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setAnimDone(true);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="flex items-center gap-4 mb-2">
      {/* Scout head — animated bobble on arrival */}
      <div className="shrink-0 scout-head-container">
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={56}
          height={56}
          unoptimized
          className="scout-head-img"
          style={{
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Greeting text — typewriter effect */}
      <div className="flex-1 min-w-0">
        <p
          className="text-base font-medium leading-relaxed"
          style={{ color: 'var(--sm-text)' }}
        >
          {displayText}
          {!animDone && (
            <span
              className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom animate-pulse"
              style={{ backgroundColor: '#BC0000' }}
            />
          )}
        </p>
      </div>

      <style>{`
        .scout-head-container {
          animation: scoutBobble 1.2s ease-out;
        }
        .scout-head-img {
          filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.25));
        }
        @keyframes scoutBobble {
          0% { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          40% { transform: scale(1.08) rotate(3deg); opacity: 1; }
          60% { transform: scale(0.97) rotate(-1deg); }
          80% { transform: scale(1.02) rotate(0.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
