'use client';

import React from 'react';

interface Reaction {
  avatar: string;
  username: string;
  comment: string;
  timestamp: string;
}

interface ReactionStreamProps {
  reactions: Reaction[];
}

export function ReactionStream({ reactions }: ReactionStreamProps) {
  return (
    <div className="space-y-3 my-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
        Fan Reactions
      </h3>
      {reactions.map((reaction, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${reaction.avatar})` }}
            />
            <span className="text-sm font-bold text-white">{reaction.username}</span>
            <span className="text-xs text-slate-500 ml-auto">{reaction.timestamp}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{reaction.comment}</p>
        </div>
      ))}
    </div>
  );
}
