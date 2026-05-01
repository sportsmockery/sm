export function ArticleComparison() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-red-400/20 bg-red-950/20 p-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-300">
          Weak Article
        </div>
        <h3 className="text-lg font-bold text-white">
          Bears Make Another Roster Move
        </h3>
        <p className="mt-3 text-sm text-zinc-300">
          “The Bears made a roster move today. Fans are reacting online. It
          remains to be seen what happens next.”
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>· No thesis</li>
          <li>· No original insight</li>
          <li>· No Chicago fan angle</li>
          <li>· Low retention risk</li>
        </ul>
      </div>

      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-950/20 p-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
          Authority Article
        </div>
        <h3 className="text-lg font-bold text-white">
          The Bears Just Made a Move That Reveals Their Real Offensive Plan
        </h3>
        <p className="mt-3 text-sm text-zinc-300">
          “The Bears’ latest roster move is not random. It points to a clear
          shift in how the front office views offensive depth.”
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>· Clear thesis</li>
          <li>· Original angle</li>
          <li>· Explains why it matters</li>
          <li>· Higher engagement potential</li>
        </ul>
      </div>
    </div>
  )
}
