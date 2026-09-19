"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Scramble from "@/components/fx/scramble"
import { hex } from "@/lib/telemetry"

/* -------------------------------------------------------------------------- */
/* Deploy — the house reveal. Panels arrive on a rail and unclip, rather than  */
/* the fadeInUp every AI page ships with.                                      */
/* -------------------------------------------------------------------------- */

export function Deploy({
  children,
  delay = 0,
  from = "up",
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  from?: "up" | "left" | "right"
  className?: string
}) {
  // No reduced-motion branch here on purpose — swapping element types after
  // hydration (motion.div -> div) remounts the subtree, and gating the motion
  // props strands the panel hidden. MotionConfig reducedMotion="user" in
  // app/page.tsx does the reduction instead.
  const offset =
    from === "left" ? { x: -28, y: 0 } : from === "right" ? { x: 28, y: 0 } : { x: 0, y: 26 }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.8,
        delay,
        clipPath: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
      }}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* CountUp — numerals that spin up when they enter view.                       */
/* -------------------------------------------------------------------------- */

export function CountUp({
  to,
  duration = 1100,
  className = "",
}: {
  to: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduced = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setN(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutExpo — fast commit, long settle
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setN(Math.round(to * e))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduced])

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {n}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* SectionHead — every section is announced like a panel on an instrument.     */
/* -------------------------------------------------------------------------- */

export function SectionHead({
  index,
  title,
  blurb,
  meta,
}: {
  index: string
  title: string
  blurb?: string
  meta?: string
}) {
  return (
    <header className="mb-12 md:mb-16">
      <Deploy>
        <div className="mb-4 flex items-center gap-4">
          <span className="label label-sig tnum">§{index}</span>
          <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
          {meta && <span className="label">{meta}</span>}
          <span className="label tnum">{hex(parseInt(index, 10) * 16, 2)}</span>
        </div>

        <Scramble
          as="h2"
          onView
          text={title}
          speed={22}
          className="font-display text-3xl font-700 uppercase tracking-[0.08em] text-[var(--txt)] md:text-5xl"
        />

        {blurb && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--txt-dim)] md:text-base">
            {blurb}
          </p>
        )}
      </Deploy>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/* Rule — a measured hairline with tick marks, used as a section divider.      */
/* -------------------------------------------------------------------------- */

export function Rule({ ticks = 24 }: { ticks?: number }) {
  return (
    <div className="relative h-4 w-full" aria-hidden="true">
      <div className="absolute inset-x-0 top-2 h-px" style={{ background: "var(--rule)" }} />
      <div className="absolute inset-x-0 top-0 flex justify-between">
        {Array.from({ length: ticks }).map((_, i) => (
          <span
            key={i}
            className="w-px"
            style={{
              height: i % 4 === 0 ? 8 : 4,
              background: i % 4 === 0 ? "var(--rule-strong)" : "var(--rule)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Section — consistent rhythm + scroll anchor for every band of the page.     */
/* -------------------------------------------------------------------------- */

export function Section({
  id,
  children,
  className = "",
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 px-5 py-20 md:px-10 md:py-28 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  )
}
