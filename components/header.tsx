"use client"

import { useEffect, useState } from "react"
import { NAV, OPERATOR } from "@/lib/site-data"

/**
 * Top rail. Section tracking uses IntersectionObserver rather than a scroll
 * handler doing getBoundingClientRect on seven nodes per frame.
 */
export default function Header() {
  const [active, setActive] = useState<string>("home")
  const [open, setOpen] = useState(false)
  const [clock, setClock] = useState("--:--:--")

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.5, 0.9] }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, "0")
      setClock(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md"
      style={{ borderColor: "var(--rule)", background: "rgba(6,7,10,0.8)" }}
    >
      <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-4 px-4 md:px-6">
        {/* mark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-target
          data-label="ORIGIN"
          className="group flex items-center gap-2.5"
          aria-label="Back to top"
        >
          <span
            className="grid h-6 w-6 place-items-center border text-[10px] font-bold"
            style={{ borderColor: "var(--sig)", color: "var(--sig)" }}
          >
            PC
          </span>
          <span className="hidden font-display text-xs font-600 uppercase tracking-[0.2em] text-[var(--txt)] sm:inline">
            {OPERATOR.callsign}
          </span>
        </button>

        {/* desktop nav */}
        <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Sections">
          {NAV.map((n) => {
            const on = active === n.id
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                data-target
                data-label={n.label}
                aria-current={on ? "true" : undefined}
                className="group relative px-3 py-1.5 text-[10px] tracking-[0.16em] transition-colors"
                style={{ color: on ? "var(--sig)" : "var(--txt-faint)" }}
              >
                <span className="mr-1.5 opacity-50 tnum">{n.index}</span>
                {n.label}
                {on && (
                  <span
                    className="absolute inset-x-1.5 -bottom-px h-px"
                    style={{ background: "var(--sig)", boxShadow: "0 0 8px var(--sig-glow)" }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* utc clock — a small, honest piece of live data */}
        <div className="ml-auto hidden items-center gap-2 lg:ml-6 lg:flex">
          <span className="label">UTC</span>
          <span className="tnum text-[10px] text-[var(--ice)]">{clock}</span>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex h-8 w-8 flex-col items-center justify-center gap-1 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span
            className="block h-px w-4 transition-transform"
            style={{
              background: "var(--sig)",
              transform: open ? "translateY(2.5px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block h-px w-4 transition-transform"
            style={{
              background: "var(--sig)",
              transform: open ? "translateY(-2.5px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* mobile sheet */}
      {open && (
        <nav
          className="border-t lg:hidden"
          style={{ borderColor: "var(--rule)", background: "rgba(6,7,10,0.97)" }}
          aria-label="Sections"
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="flex w-full items-center gap-3 border-b px-5 py-3 text-left text-xs tracking-[0.16em]"
              style={{
                borderColor: "var(--rule-soft)",
                color: active === n.id ? "var(--sig)" : "var(--txt-dim)",
              }}
            >
              <span className="label tnum">{n.index}</span>
              {n.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
