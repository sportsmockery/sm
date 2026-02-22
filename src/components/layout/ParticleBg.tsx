'use client'

export default function ParticleBg() {
  return (
    <>
      <div className="particle-bg" aria-hidden="true" />
      <style>{`
        .particle-dot {
          position: fixed;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--sm-red);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }
        .particle-dot:nth-child(1) { top: 10%; left: 25%; animation: float-particle 10s ease-in-out infinite; }
        .particle-dot:nth-child(2) { top: 30%; right: 15%; animation: float-particle 14s ease-in-out infinite 1s; }
        .particle-dot:nth-child(3) { top: 50%; left: 10%; animation: float-particle 9s ease-in-out infinite 3s; }
        .particle-dot:nth-child(4) { top: 70%; right: 30%; animation: float-particle 11s ease-in-out infinite 2s; }
        .particle-dot:nth-child(5) { top: 85%; left: 40%; animation: float-particle 13s ease-in-out infinite 4s; }
      `}</style>
      <div className="particle-dot" aria-hidden="true" />
      <div className="particle-dot" aria-hidden="true" />
      <div className="particle-dot" aria-hidden="true" />
      <div className="particle-dot" aria-hidden="true" />
      <div className="particle-dot" aria-hidden="true" />
    </>
  )
}
