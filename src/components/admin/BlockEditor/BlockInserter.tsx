'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface BlockInserterProps {
  onRequestModal: () => void;
  // When true, the trigger fades in even without hover (used to reveal the
  // adjacent inserter while the writer's cursor is in the neighbouring block).
  revealed?: boolean;
}

export function BlockInserter({ onRequestModal, revealed = false }: BlockInserterProps) {
  return (
    <div className="block-inserter-wrap">
      <div className="group/inserter relative flex justify-center py-1.5">
        <button
          type="button"
          onClick={onRequestModal}
          className={`block-inserter-trigger flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-100 hover:scale-[1.03] active:scale-[0.97] focus:outline-none ${
            revealed ? 'is-revealed' : ''
          }`}
          style={{
            backgroundColor: 'rgba(0,212,255,0.1)',
            color: '#00D4FF',
            border: '1px solid rgba(0,212,255,0.3)',
          }}
          aria-label="Add block here"
        >
          <Plus size={11} />
          Add Block
        </button>

        <span
          aria-hidden
          className={`pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-opacity duration-150 ${
            revealed ? 'opacity-100' : 'opacity-0 group-hover/inserter:opacity-100'
          }`}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,212,255,0.25), transparent)',
          }}
        />

        <style jsx>{`
          .block-inserter-trigger {
            opacity: 0;
            transition-property: opacity, transform, background-color, box-shadow, border-color;
            transition-duration: 120ms;
          }
          .group\\/inserter:hover .block-inserter-trigger,
          .group\\/inserter:focus-within .block-inserter-trigger,
          .block-inserter-trigger.is-revealed {
            opacity: 1;
          }
        `}</style>
      </div>
    </div>
  );
}
