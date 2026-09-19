"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { Deploy, Section, SectionHead, CountUp } from "@/components/chrome"
import { CAPABILITIES, CORE_COMPETENCIES } from "@/lib/site-data"

/**
 * Capability banks.
 *
 * Levels are drawn as segmented signal meters rather than smooth progress bars —
 * discrete cells read as an instrument gauge, and they make the difference
 * between 85 and 90 actually visible instead of a few pixels of gradient.
 */

const CELLS = 20

function Meter({ level, delay }: { level: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduced = useReducedMotion()
  const lit = Math.round((level / 100) * CELLS)

  return (
    <div ref={ref} className="flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: CELLS }).map((_, i) => {
        const on = i < lit
        // the top two cells of any bank run hot — amber → ice at the ceiling
        const color = i >= CELLS - 2 ? "var(--ice)" : "var(--sig)"
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={inView ? { opacity: 1, scaleY: 1 } : {}}
            transition={{ delay: reduced ? 0 : delay + i * 0.022, duration: 0.25 }}
            className="h-3.5 flex-1 origin-bottom"
            style={{
              background: on ? color : "var(--panel-3)",
              boxShadow: on && i >= lit - 1 ? `0 0 7px ${color}` : "none",
              opacity: on ? 1 : 0.5,
            }}
          />
        )
      })}
    </div>
  )
}

export default function Skills() {
  return (
    <Section id="skills">
      <SectionHead
        index="03"
        title="CAPABILITY"
        meta="3 BANKS"
        blurb="Self-assessed proficiency across the stack. The honest version — the ceiling is where I ship confidently without looking things up."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {CAPABILITIES.map((bank, bi) => (
          <Deploy key={bank.bank} delay={bi * 0.08}>
            <div className="bracket h-full p-5 md:p-6">
              <div
                className="mb-6 flex items-center justify-between border-b pb-3"
                style={{ borderColor: "var(--rule)" }}
              >
                <h3 className="font-display text-sm font-600 uppercase tracking-[0.2em] text-[var(--txt)]">
                  {bank.bank}
                </h3>
                <span className="label label-sig tnum">{bank.code}</span>
              </div>

              <ul className="space-y-5">
                {bank.items.map((s, si) => (
                  <li key={s.name}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-xs text-[var(--txt-dim)]">{s.name}</span>
                      <span className="tnum text-[11px] font-medium text-[var(--sig)]">
                        <CountUp to={s.level} duration={900} />
                        <span className="text-[var(--sig-dim)]">%</span>
                      </span>
                    </div>
                    <Meter level={s.level} delay={bi * 0.08 + si * 0.06} />
                  </li>
                ))}
              </ul>
            </div>
          </Deploy>
        ))}
      </div>

      {/* core competencies as a dial row */}
      <Deploy delay={0.1}>
        <div className="bracket mt-5 p-5 md:p-7">
          <div
            className="mb-7 flex items-center gap-3 border-b pb-3"
            style={{ borderColor: "var(--rule)" }}
          >
            <h3 className="font-display text-sm font-600 uppercase tracking-[0.2em] text-[var(--txt)]">
              CORE COMPETENCIES
            </h3>
            <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
            <span className="label">NON-TECHNICAL INCLUDED</span>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_COMPETENCIES.map((c, i) => (
              <Dial key={c.name} name={c.name} level={c.level} code={c.code} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </Deploy>
    </Section>
  )
}

/* ---------------------------------- dial ---------------------------------- */

function Dial({
  name,
  level,
  code,
  delay,
}: {
  name: string
  level: number
  code: string
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduced = useReducedMotion()

  const R = 34
  // 270° sweep, like a real gauge rather than a full ring
  const sweep = 0.75
  /**
   * Rounded to 3dp because these land in SSR'd SVG attributes. Math.sin/cos
   * disagree in the last bits between Node and the browser, so the raw values
   * render as 5.358983848622458 on the server and ...465 on the client, and
   * React throws the hydrated tree away over it.
   */
  const r3 = (n: number) => Number(n.toFixed(3))
  const C = r3(2 * Math.PI * R)
  const arc = r3(C * sweep)

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-[135deg]">
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="var(--panel-3)"
            strokeWidth="4"
            strokeDasharray={`${arc} ${C}`}
            strokeLinecap="butt"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="var(--sig)"
            strokeWidth="4"
            strokeLinecap="butt"
            strokeDasharray={`${arc} ${C}`}
            initial={{ strokeDashoffset: arc }}
            animate={inView ? { strokeDashoffset: arc * (1 - level / 100) } : {}}
            transition={{ duration: reduced ? 0 : 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: "drop-shadow(0 0 5px var(--sig-glow))" }}
          />
          {/* tick marks around the sweep */}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 9) * sweep * 2 * Math.PI
            const x1 = r3(40 + Math.cos(a) * (R + 6))
            const y1 = r3(40 + Math.sin(a) * (R + 6))
            const x2 = r3(40 + Math.cos(a) * (R + 9))
            const y2 = r3(40 + Math.sin(a) * (R + 9))
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--rule-strong)"
                strokeWidth="1"
              />
            )
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-700 text-[var(--sig)]">
            <CountUp to={level} duration={1100} />
          </span>
          <span className="label tnum mt-0.5 opacity-50">{code}</span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-snug text-[var(--txt-dim)]">{name}</p>
    </div>
  )
}
