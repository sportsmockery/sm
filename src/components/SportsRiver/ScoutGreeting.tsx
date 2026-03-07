'use client';

import React from 'react';

export default function ScoutGreeting() {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-4">
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--sm-text-muted)' }}
      >
        {timeGreeting} — here&apos;s what Chicago fans need to know right now.
      </p>
    </div>
  );
}
