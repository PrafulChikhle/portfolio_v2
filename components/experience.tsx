"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { Section, SectionHead } from "@/components/chrome"
import { SERVICE_LOG, type ServiceRecord } from "@/lib/site-data"

/**
 * Service log, rendered as `git log --graph`.
 *
 * The rail is a real SVG path that draws itself as the section scrolls (stroke
 * dashoffset driven by scroll position), commits land as nodes on it, and each
 * record expands in place. Reversing a career into commit history is the one
 * joke the whole section is built on, so it commits to the bit: short hashes,
 * HEAD on the current role, refs, the lot.
 */

function Commit({ rec, index }: { rec: ServiceRecord; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduced = useReducedMotion()

  return (
    <div ref={ref} className="relative pl-10 md:pl-16">
      {/* node on the rail */}
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute left-[9px] top-[18px] grid h-[15px] w-[15px] place-items-center rounded-full md:left-[25px]"
        style={{
          background: "var(--void)",
          border: `2px solid ${rec.current ? "var(--sig)" : "var(--sig-deep)"}`,
          boxShadow: rec.current ? "0 0 12px var(--sig-glow)" : "none",
        }}
      >
        {rec.current && (
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: "var(--sig)", animation: "pulse-dot 2s ease-in-out infinite" }}
          />
        )}
      </motion.span>

      <motion.article
        initial={{ opacity: 0, x: 18 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.06 }}
        className="bracket mb-4"
      >
        {/* commit line */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          data-target
          data-label={open ? "COLLAPSE" : "EXPAND"}
          className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 border-b px-4 py-3 text-left transition-colors hover:bg-[rgba(255,176,0,0.04)]"
          style={{ borderColor: open ? "var(--rule)" : "transparent" }}
        >
          <span className="tnum text-[11px] font-medium text-[var(--sig)]">{rec.hash}</span>

          {rec.current && (
            <span
              className="label border px-1.5 py-px"
              style={{ borderColor: "var(--sig)", color: "var(--sig)" }}
            >
              HEAD → main
            </span>
          )}

          <span className="flex-1 text-xs text-[var(--txt)] md:text-[13px]">
            {rec.position}
          </span>

          <span className="label hidden md:inline">{rec.duration}</span>

          <span
            className="label transition-transform duration-300"
            style={{ transform: open ? "rotate(90deg)" : "none" }}
          >
            ▸
          </span>
        </button>

        {/* body */}
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="p-4 md:p-6">
            {/* author / date block, like a real commit */}
            <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-2.5">
                <span
                  className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden border"
                  style={{ borderColor: "var(--rule)" }}
                >
                  {rec.logo ? (
                    <Image
                      src={rec.logo}
                      alt=""
                      width={28}
                      height={28}
                      className="h-full w-full object-contain p-0.5"
                    />
                  ) : (
                    /* No logo asset — a monogram reads as intentional console
                       chrome, where a placeholder image would read as broken. */
                    <span
                      className="text-[10px] font-bold leading-none"
                      style={{ color: "var(--sig)" }}
                    >
                      {rec.company
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                  )}
                </span>
                <span className="text-xs text-[var(--txt)]">{rec.company}</span>
              </span>

              <span className="label">{rec.location}</span>
              <span className="label">{rec.type}</span>
              <span className="label md:hidden">{rec.duration}</span>

              {rec.site !== "#" && (
                <a
                  href={rec.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-target
                  data-label="EXTERNAL"
                  className="label ml-auto transition-colors hover:text-[var(--ice)]"
                  style={{ color: "var(--ice-dim)" }}
                >
                  ↗ SITE
                </a>
              )}
            </div>

            <p className="text-xs leading-[1.85] text-[var(--txt-dim)] md:text-[13px]">
              {rec.summary}
            </p>

            {/* diff-styled achievements — omitted entirely for a posting with
                no recorded changes yet, rather than showing an empty heading */}
            {rec.achievements.length > 0 && (
              <div className="mt-6">
                <p className="label mb-3">CHANGES</p>
                <ul className="space-y-2">
                  {rec.achievements.map((a, i) => (
                    <li
                      key={i}
                      className="flex gap-3 border-l-2 pl-3 text-xs leading-relaxed text-[var(--txt-dim)]"
                      style={{ borderColor: "var(--sig-deep)" }}
                    >
                      <span className="shrink-0 font-medium text-[var(--sig)]">+</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rec.stack.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {rec.stack.map((t) => (
                  <span
                    key={t}
                    className="label border px-1.5 py-0.5"
                    style={{ borderColor: "var(--rule)", color: "var(--txt-faint)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.article>
    </div>
  )
}

export default function Experience() {
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap, { once: true, margin: "-120px" })
  const reduced = useReducedMotion()

  return (
    <Section id="experience">
      <SectionHead
        index="04"
        title="SERVICE LOG"
        meta={`${SERVICE_LOG.length} COMMITS`}
        blurb="Eleven years of postings, in reverse chronological order. Expand any commit for the full diff."
      />

      <div ref={wrap} className="relative">
        {/* the rail — an SVG line that draws itself once the section is reached */}
        <svg
          className="pointer-events-none absolute left-[16px] top-0 h-full w-px overflow-visible md:left-[32px]"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <motion.line
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            stroke="var(--sig-deep)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </svg>

        {SERVICE_LOG.map((rec, i) => (
          <Commit key={rec.hash} rec={rec} index={i} />
        ))}

        {/* root commit */}
        <div className="relative pl-10 md:pl-16">
          <span
            className="absolute left-[11px] top-[7px] h-[11px] w-[11px] rotate-45 md:left-[27px]"
            style={{ border: "1px solid var(--sig-deep)", background: "var(--void)" }}
          />
          <p className="label pt-1">ROOT COMMIT · {SERVICE_LOG[SERVICE_LOG.length - 1].duration.split(" — ")[0]} · initial import</p>
        </div>
      </div>
    </Section>
  )
}
