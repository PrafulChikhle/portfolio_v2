"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Deploy, Section, SectionHead } from "@/components/chrome"
import { PROJECTS, type Project } from "@/lib/site-data"

/**
 * Module bay.
 *
 * Cards tilt in real 3D off pointer position (rotateX/rotateY on a perspective
 * parent, plus a specular sheen that tracks the same coordinates). The tilt is
 * written straight to style on pointermove — running it through React state
 * would re-render nine cards per frame for no reason.
 */

function ModuleCard({
  p,
  index,
  onOpen,
}: {
  p: Project
  index: number
  onOpen: (p: Project) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const sheen = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  const onMove = (e: React.PointerEvent) => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 9}deg) rotateX(${(0.5 - y) * 9}deg) translateZ(6px)`
    if (sheen.current) {
      sheen.current.style.background = `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,176,0,0.13), transparent 60%)`
    }
  }

  const reset = () => {
    const el = ref.current
    if (el) el.style.transform = ""
    if (sheen.current) sheen.current.style.background = "transparent"
  }

  return (
    <Deploy delay={Math.min(index * 0.05, 0.3)}>
      <button
        ref={ref}
        data-module={p.id}
        data-target
        data-label={`OPEN ${p.id}`}
        onPointerMove={onMove}
        onPointerLeave={reset}
        onClick={() => onOpen(p)}
        aria-label={`Open module ${p.id}: ${p.title}`}
        className="bracket group h-full w-full text-left transition-[transform,border-color] duration-200 will-change-transform hover:border-[var(--rule-strong)]"
      >
        <span
          ref={sheen}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 transition-[background] duration-200"
        />

        {/* module header */}
        <span
          className="flex items-center justify-between border-b px-3 py-2"
          style={{ borderColor: "var(--rule)" }}
        >
          <span className="label label-sig tnum">{p.id}</span>
          <span className="label tnum">{p.year}</span>
        </span>

        {/* imagery */}
        <span className="relative block aspect-[16/10] overflow-hidden">
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover grayscale-[0.85] contrast-125 transition-all duration-700 group-hover:scale-[1.06] group-hover:grayscale-[0.3]"
          />
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(6,7,10,0.25) 0%, rgba(6,7,10,0.55) 55%, rgba(10,12,16,0.97) 100%)",
            }}
          />
          {/* scan texture, so imagery reads as sensor capture not stock photo */}
          <span
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "repeating-linear-gradient(180deg, transparent 0 3px, rgba(0,0,0,0.5) 3px 4px)",
            }}
          />
        </span>

        {/* body */}
        <span className="block p-4 md:p-5">
          <span className="font-display block text-[15px] font-600 uppercase leading-snug tracking-[0.04em] text-[var(--txt)] transition-colors group-hover:text-[var(--sig)]">
            {p.title}
          </span>

          <span className="mt-2.5 block text-xs leading-relaxed text-[var(--txt-dim)]">
            {p.summary}
          </span>

          <span className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="label border px-1.5 py-0.5"
                style={{ borderColor: "var(--rule)", color: "var(--txt-faint)" }}
              >
                {t}
              </span>
            ))}
            {p.tags.length > 4 && (
              <span className="label px-1 py-0.5 text-[var(--sig-dim)]">
                +{p.tags.length - 4}
              </span>
            )}
          </span>

          <span className="mt-4 flex items-center gap-2 text-[10px] tracking-[0.18em] text-[var(--ice)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            INSPECT
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </span>
      </button>
    </Deploy>
  )
}

/* ------------------------------- detail view ------------------------------ */

function ModuleDialog({ p, onClose }: { p: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(3,4,6,0.86)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-title"
    >
      <motion.div
        initial={{ clipPath: "inset(48% 0 48% 0)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0 0% 0)", opacity: 1 }}
        exit={{ clipPath: "inset(48% 0 48% 0)", opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bracket max-h-[88vh] w-full max-w-3xl overflow-y-auto"
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-2.5 backdrop-blur"
          style={{ borderColor: "var(--rule)", background: "rgba(10,12,16,0.94)" }}
        >
          <span className="label label-sig tnum">MODULE {p.id}</span>
          <button
            ref={closeRef}
            onClick={onClose}
            className="label border px-2 py-1 transition-colors hover:text-[var(--alert)]"
            style={{ borderColor: "var(--rule)" }}
            aria-label="Close module detail"
          >
            ESC ✕
          </button>
        </div>

        <div className="relative aspect-[21/9]">
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover grayscale-[0.4]"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 30%, rgba(10,12,16,0.97) 100%)",
            }}
          />
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="label tnum">{p.year}</span>
            <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
          </div>

          <h3
            id="module-title"
            className="font-display text-xl font-700 uppercase tracking-[0.04em] text-[var(--txt)] md:text-3xl"
          >
            {p.title}
          </h3>

          <p className="mt-5 text-sm leading-[1.85] text-[var(--txt-dim)]">{p.details}</p>

          <div className="mt-7">
            <p className="label mb-3">SUBSYSTEMS</p>
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="border px-2.5 py-1 text-[11px]"
                  style={{ borderColor: "var(--rule)", color: "var(--sig-dim)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* --------------------------------- section -------------------------------- */

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null)

  return (
    <Section id="projects">
      <SectionHead
        index="02"
        title="MODULE BAY"
        meta={`${PROJECTS.length} UNITS`}
        blurb="Selected systems shipped in production — visualisation engines, editors, platform libraries, and the dashboards operations teams actually live in."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <ModuleCard key={p.id} p={p} index={i} onOpen={setOpen} />
        ))}
      </div>

      <AnimatePresence>
        {open && <ModuleDialog p={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </Section>
  )
}
