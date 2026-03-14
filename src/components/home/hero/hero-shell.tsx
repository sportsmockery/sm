"use client"

import Image from "next/image"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Hero Shell                                                         */
/*  Shared structural wrapper for all hero modes.                      */
/* ------------------------------------------------------------------ */

interface HeroShellProps {
  children: ReactNode
  logo?: ReactNode
  background?: ReactNode
  className?: string
  ariaLabel?: string
}

export function HeroShell({
  children,
  logo,
  background,
  className = "",
  ariaLabel = "Homepage hero",
}: HeroShellProps) {
  return (
    <section
      className={`relative flex min-h-screen flex-col overflow-hidden ${className}`}
      style={{ background: "var(--hp-background)", color: "var(--hp-foreground)" }}
      aria-label={ariaLabel}
    >
      {background}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="flex items-center justify-start" style={{ marginLeft: "-400px", marginTop: "-50px" }}>
          {logo ?? (
            <Image
              src="/edge_logo.svg"
              alt="SM Edge"
              width={720}
              height={264}
              className="w-[720px] h-[264px] object-contain opacity-80"
              priority
            />
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8" style={{ marginTop: "-280px" }}>
        {children}
      </div>
    </section>
  )
}

/* ── Shared CTA Button ── */

interface HeroCtaProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "secondary"
  className?: string
}

export function HeroCta({ children, href, onClick, variant = "primary", className = "" }: HeroCtaProps) {
  const isPrimary = variant === "primary"

  const baseStyles: React.CSSProperties = isPrimary
    ? {
        backgroundColor: "#BC0000",
        color: "#FAFAFB",
        border: "2px solid transparent",
      }
    : {
        backgroundColor: "transparent",
        color: "var(--hp-foreground)",
        border: "1px solid var(--hp-border)",
      }

  const classes = `group relative inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${className}`.trim()

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (isPrimary) {
      el.style.boxShadow = "0 0 20px rgba(0, 212, 255, 0.25), 0 0 6px rgba(0, 212, 255, 0.15)"
      el.style.borderColor = "rgba(0, 212, 255, 0.5)"
    } else {
      el.style.borderColor = "rgba(188, 0, 0, 0.3)"
      el.style.backgroundColor = "var(--hp-muted)"
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (isPrimary) {
      el.style.boxShadow = "none"
      el.style.borderColor = "transparent"
    } else {
      el.style.borderColor = "var(--hp-border)"
      el.style.backgroundColor = "transparent"
    }
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        style={baseStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  )
}
