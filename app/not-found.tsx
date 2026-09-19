"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

/**
 * 404 as a kernel panic. The stack trace is fabricated but internally
 * consistent — the frames name real modules from this codebase, which is the
 * part that makes the joke land for anyone who checks.
 */

const TRACE = [
  "avionics_router_resolve+0x1f4/0x300 [router]",
  "route_lookup_section+0x8a/0x1c0 [router]",
  "nav_dispatch+0x2d/0x90 [console]",
  "section_mount+0x11c/0x240 [chrome]",
  "__hydrate_boundary+0x66/0xd0 [react]",
  "page_entry+0x1a/0x40",
]

export default function NotFound() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const id = window.setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      420
    )
    return () => clearInterval(id)
  }, [])

  return (
    <main className="relative flex min-h-[100svh] items-center px-5 py-16 md:px-10">
      <div className="fx-scan" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />

      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--alert)", animation: "pulse-dot 1.2s ease-in-out infinite" }}
          />
          <span className="label" style={{ color: "var(--alert)" }}>
            KERNEL PANIC — NOT SYNCING
          </span>
          <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
          <span className="label tnum">0x194</span>
        </div>

        <h1
          className="font-display text-[clamp(3rem,16vw,9rem)] font-700 leading-[0.85] tracking-tight"
          style={{ color: "var(--alert)" }}
        >
          404
        </h1>

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--txt-dim)]">
          The router could not resolve that address. Either the section was
          decommissioned, or the link was never valid in the first place.
        </p>

        <div className="bracket mt-8 p-5">
          <p className="label mb-4">CALL TRACE</p>
          <pre className="overflow-x-auto text-[11px] leading-[1.7] text-[var(--txt-faint)]">
{TRACE.map((t, i) => ` [<${(0xffff8100 + i * 0x40).toString(16)}>] ${t}`).join("\n")}
          </pre>
          <p className="mt-4 text-[11px] text-[var(--txt-faint)]">
            ---[ end trace {Math.abs(Date.now() % 0xffffffff).toString(16)} ]---
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="sweep group border px-5 py-2.5 text-[11px] tracking-[0.18em] transition-colors"
            style={{ borderColor: "var(--sig)", color: "var(--sig)" }}
          >
            <span className="mr-3 inline-block transition-transform group-hover:-translate-x-1">
              ←
            </span>
            REBOOT TO ORIGIN
          </Link>
          <span className="label">attempting recovery{dots}</span>
        </div>
      </div>
    </main>
  )
}
