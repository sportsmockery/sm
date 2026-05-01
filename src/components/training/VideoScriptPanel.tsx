'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function VideoScriptPanel({ script }: { script: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Editor / Admin
          </div>
          <div className="text-sm font-bold text-white">Video Script</div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="border-t border-white/10 px-5 py-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
            {script}
          </p>
        </div>
      ) : null}
    </div>
  )
}
