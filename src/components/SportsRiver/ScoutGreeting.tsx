'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

// Central time (America/Chicago) — morning < 11, afternoon < 17, evening < 21, late night >= 21
function getCentralHour(): number {
  if (typeof window === 'undefined') return new Date().getHours();
  return parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hour12: false }),
    10
  );
}

const MORNING_GREETINGS = [
  "Rise and grind, {name}. Let me catch you up before the day gets crazy.",
  "Yo {name}, morning. Grab your coffee — we got stuff to talk about.",
  "Top of the morning, {name}. Chicago never sleeps and neither does the news.",
];
const AFTERNOON_GREETINGS = [
  "Ayyy {name}, you're just in time. Lot going on around the city today.",
  "{name}! Alright, let's get into it — here's what you need to know right now.",
  "What's good, {name}. Pull up, I got the latest for you.",
];
const EVENING_GREETINGS = [
  "Yo {name}, welcome back. Let me run you through what went down today.",
  "{name}! Good timing — some wild stuff happened today, let me fill you in.",
  "What's up, {name}. Long day? I got the recap, let's go.",
];
const LATE_NIGHT_GREETINGS = [
  "Still up, {name}? Same. Here's what's happening around Chicago sports right now.",
];

function pickGreeting(hour: number, name: string): string {
  const n = name || 'there';
  let list: string[];
  if (hour < 11) list = MORNING_GREETINGS;
  else if (hour < 17) list = AFTERNOON_GREETINGS;
  else if (hour < 21) list = EVENING_GREETINGS;
  else list = LATE_NIGHT_GREETINGS;
  const template = list[hour % list.length];
  return template.replace(/\{name\}/g, n);
}

interface ScoutGreetingProps {
  showIcon?: boolean;
}

export default function ScoutGreeting({ showIcon = true }: ScoutGreetingProps) {
  const { user, isAuthenticated } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const [animDone, setAnimDone] = useState(false);
  const animRef = useRef(false);

  const userName =
    isAuthenticated && user?.name
      ? user.name.split(' ')[0]
      : isAuthenticated && user?.email
        ? user.email.split('@')[0]
        : 'there';

  const fullText = useMemo(() => {
    const hour = getCentralHour();
    return pickGreeting(hour, userName);
  }, [userName]);

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

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true });

  const textBlock = (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <span
          className="font-bold uppercase tracking-[0.12em]"
          style={{ color: '#00D4FF', fontSize: '2.25rem' }}
        >
          Scout Report
        </span>
        <span className="text-xs" style={{ color: 'var(--sm-text-meta)', opacity: 0.5 }}>·</span>
        <span className="text-xs" style={{ color: 'var(--sm-text-meta)', fontSize: 'var(--font-size-xs)' }}>
          Updated {timeStr}
        </span>
      </div>
      <p
        className="sm-greeting-text"
        style={{ color: 'var(--sm-text)', fontSize: 'var(--font-size-greeting, 18px)', fontWeight: 500 }}
      >
        {displayText}
        {!animDone && (
          <span
            className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom animate-pulse"
            style={{ backgroundColor: 'var(--sm-red)' }}
          />
        )}
      </p>
    </div>
  );

  if (!showIcon) {
    return textBlock;
  }

  return (
    <div className="flex items-start gap-4 mb-1">
      <div className="shrink-0 scout-head-container" style={{ marginTop: 2 }}>
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={96}
          height={96}
          unoptimized
          className="scout-head-img"
          style={{ borderRadius: '50%', objectFit: 'cover', width: 96, height: 96 }}
        />
      </div>
      {textBlock}
      <style>{`
        .scout-head-container { animation: scoutBobble 1.2s ease-out; }
        .scout-head-img { filter: none; }
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
