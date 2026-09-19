"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Scramble from "@/components/fx/scramble"
import { CountUp, Rule } from "@/components/chrome"
import { OPERATOR, VITALS, resumeLinkProps } from "@/lib/site-data"
import { hex } from "@/lib/telemetry"


/**
 * The hero is laid out as an instrument panel: an asymmetric 7/5 split with the
 * identification block on the left and the operator plate on the right, both
 * hung off a shared measurement rule. Nothing is centered — centering is what
 * makes generic hero sections read as generic.
 */
export default function Hero() {


  /**
   * These props are declared unconditionally on purpose — MotionConfig
   * reducedMotion="user" (see app/page.tsx) handles the reduction. Gating them
   * on useReducedMotion() strands elements at their initial hidden style,
   * because that hook reads false during hydration and flips afterwards.
   */
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" },
    animate: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  })

  // Derived from the operator record rather than hardcoded, so a title change
  // only has to be made in one place. Last word drops to its own line.
  const titleWords = OPERATOR.role.toUpperCase().split(" ")
  const titleLead = titleWords.slice(0, -1).join(" ")
  const titleTail = titleWords[titleWords.length - 1]

  return (
    <section id="home" className="relative min-h-[100svh] px-5 pb-16 pt-24 md:px-10 md:pt-28">
      <div className="mx-auto w-full max-w-6xl">
        {/* top annotation rail */}
        <motion.div {...rise(0.05)} className="mb-10 flex items-center gap-4">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--sig)", animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          <span className="label label-sig">OPERATOR ONLINE</span>
          <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
          <span className="label hidden sm:inline">{OPERATOR.station}</span>
          <span className="label tnum hidden md:inline">{hex(2050, 4)}</span>
        </motion.div>

        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ---- identification block -------------------------------------- */}
          <div className="lg:col-span-7">
            <motion.p {...rise(0.1)} className="label mb-5">
              IDENTIFICATION / {OPERATOR.since}—PRESENT
            </motion.p>

            <h1 className="font-display leading-[0.92]">
              <Scramble
                as="div"
                text={titleLead}
                speed={26}
                className="block text-[clamp(2.1rem,7.5vw,5.2rem)] font-700 uppercase tracking-[0.01em] text-[var(--txt)]"
              />
              <Scramble
                as="div"
                text={titleTail}
                speed={34}
                delay={220}
                className="glow block text-[clamp(2.1rem,7.5vw,5.2rem)] font-700 uppercase tracking-[0.01em]"
              />
              <motion.div
                {...rise(0.55)}
                className="mt-2 flex items-center gap-3 text-[clamp(0.9rem,2.2vw,1.5rem)] font-500 uppercase tracking-[0.18em] text-[var(--txt-faint)]"
              >
                <span className="h-px w-8" style={{ background: "var(--sig)" }} />
                {OPERATOR.rank}
              </motion.div>
            </h1>

            <motion.p
              {...rise(0.68)}
              className="mt-8 max-w-xl text-sm leading-relaxed text-[var(--txt-dim)] md:text-base"
            >
              {OPERATOR.brief}
            </motion.p>

            {/* vitals */}
            <motion.div {...rise(0.8)} className="mt-10">
              <Rule ticks={20} />
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                {VITALS.map((v) => (
                  <div key={v.label}>
                    <dd className="font-display text-3xl font-700 text-[var(--sig)] md:text-4xl">
                      <CountUp to={v.value} />
                      <span className="text-[var(--sig-dim)]">{v.suffix}</span>
                    </dd>
                    <dt className="label mt-1.5 block">{v.label}</dt>
                    <span className="label tnum mt-0.5 block opacity-40">{hex(v.value)}</span>
                  </div>
                ))}
              </dl>
            </motion.div>

            {/* actions */}
            <motion.div {...rise(0.92)} className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
                }
                data-target
                data-label="9 MODULES"
                className="sweep group border px-5 py-2.5 text-[11px] tracking-[0.18em] transition-colors"
                style={{ borderColor: "var(--sig)", color: "var(--sig)" }}
              >
                INSPECT MODULES
                <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* Ice, not amber: this design reserves the secondary hue for
                  things the visitor can act on, and downloading the dossier is
                  the single most actionable thing on the page. */}
              <a
                {...resumeLinkProps()}
                data-target
                data-label="DOSSIER · PDF"
                className="sweep group flex items-center gap-3 border px-5 py-2.5 text-[11px] tracking-[0.18em] transition-colors"
                style={{ borderColor: "var(--ice-dim)", color: "var(--ice)" }}
              >
                DOSSIER
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-y-0.5"
                  aria-hidden="true"
                >
                  ↓
                </span>
                <span className="label" style={{ color: "var(--ice-dim)" }}>
                  PDF
                </span>
              </a>

              <a
                href={`mailto:${OPERATOR.email}`}
                data-target
                data-label="UPLINK"
                className="border px-5 py-2.5 text-[11px] tracking-[0.18em] text-[var(--txt-dim)] transition-colors hover:text-[var(--ice)]"
                style={{ borderColor: "var(--rule)" }}
              >
                OPEN UPLINK
              </a>

              <kbd
                className="label hidden border px-2 py-1.5 md:inline-block"
                style={{ borderColor: "var(--rule)" }}
              >
                ⌘K — COMMAND
              </kbd>
            </motion.div>
          </div>

          {/* ---- operator plate -------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, x: 26, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, x: 0, clipPath: "inset(0 0 0% 0)" }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <figure className="bracket group relative">
              {/* plate header */}
              <figcaption
                className="flex items-center justify-between border-b px-3 py-2"
                style={{ borderColor: "var(--rule)" }}
              >
                <span className="label label-sig">OPERATOR PLATE</span>
                <span className="label tnum">REV.04</span>
              </figcaption>

              <div className="relative aspect-[4/5] overflow-hidden">
                {/* The source is a full-body shot, so object-cover alone would
                    leave the face ~40px tall on the plate. The scale crops in
                    to a portrait; transform-origin is the framing control —
                    lower values push the subject down the frame. */}
                <Image
                  src={OPERATOR.avatar}
                  alt={`${OPERATOR.callsign}, ${OPERATOR.role}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover grayscale transition-all duration-700 group-hover:grayscale-[0.6]"
                  style={{ transform: "scale(1.75)", transformOrigin: "62% 64%" }}
                />

                {/* amber duotone wash that lifts on hover, so the photo belongs to the console */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-700 group-hover:opacity-40"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,176,0,0.16) 0%, rgba(6,7,10,0.1) 45%, rgba(6,7,10,0.92) 100%)",
                    mixBlendMode: "hard-light",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, rgba(6,7,10,0.95) 100%)",
                  }}
                />

                {/* corner crosshairs */}
                {[
                  "left-3 top-3 border-l border-t",
                  "right-3 top-3 border-r border-t",
                  "bottom-3 left-3 border-b border-l",
                  "bottom-3 right-3 border-b border-r",
                ].map((c) => (
                  <span
                    key={c}
                    className={`pointer-events-none absolute h-4 w-4 ${c}`}
                    style={{ borderColor: "var(--sig)", opacity: 0.7 }}
                  />
                ))}

                {/* readout overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-lg font-600 uppercase tracking-[0.12em] text-[var(--txt)]">
                    {OPERATOR.callsign}
                  </p>
                  <p className="label mt-1">
                    {OPERATOR.role} · {OPERATOR.station}
                  </p>
                </div>
              </div>

              {/* plate footer readout */}
              <div
                className="flex items-center justify-between border-t px-3 py-2"
                style={{ borderColor: "var(--rule)" }}
              >
                <span className="label">STATUS</span>
                <span className="label label-sig">■ ACTIVE DUTY</span>
              </div>
            </figure>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.button
        {...rise(1.1)}
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-label="Scroll to profile"
      >
        <span className="label">DESCEND</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="block h-6 w-px"
          style={{ background: "linear-gradient(180deg, var(--sig), transparent)" }}
        />
      </motion.button>
    </section>
  )
}
