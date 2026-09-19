"use client"

import { useEffect, useRef, useState } from "react"
import { gpuString } from "@/lib/telemetry"

/**
 * Power-on self test.
 *
 * Runs once per session (sessionStorage), so a visitor reading three pages does
 * not sit through it three times. Skippable with any key or click — a boot
 * sequence you cannot escape is a toll booth, not a flourish.
 *
 * Under reduced motion it never mounts at all.
 */

type Line = { text: string; status?: "OK" | "WARN" | "..." }

export default function Boot({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<Line[]>([])
  const [phase, setPhase] = useState<"boot" | "wipe" | "gone">("boot")
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase("wipe")
    window.setTimeout(() => {
      setPhase("gone")
      onDone()
    }, 620)
  }

  useEffect(() => {
    const script: Line[] = [
      { text: "avionics bios v20.50.1 — cold start", status: "OK" },
      { text: `render device :: ${gpuString()}`, status: "OK" },
      { text: `viewport :: ${window.innerWidth}x${window.innerHeight} @ ${window.devicePixelRatio || 1}x`, status: "OK" },
      { text: "mounting /operator/praful", status: "OK" },
      { text: "loading service log — 5 records", status: "OK" },
      { text: "loading module bay — 9 modules", status: "OK" },
      { text: "compiling contour shader", status: "OK" },
      { text: "calibrating reticle", status: "OK" },
      { text: "legacy angularjs shim", status: "WARN" },
      { text: "uplink established", status: "OK" },
    ]

    let i = 0
    const timers: number[] = []

    const push = () => {
      if (doneRef.current) return
      if (i >= script.length) {
        timers.push(window.setTimeout(finish, 260))
        return
      }
      // Capture the line BEFORE advancing. A `setLines(prev => [...prev,
      // script[i]])` updater reads `i` when React runs it, which is after the
      // increment below — that appends script[length] (undefined) on the last
      // tick and blows up the render.
      const line = script[i]
      i++
      setLines((prev) => [...prev, line])
      // uneven cadence reads as a real machine; a fixed interval reads as a loop
      timers.push(window.setTimeout(push, 60 + Math.random() * 85))
    }

    timers.push(window.setTimeout(push, 120))

    const skip = () => finish()
    window.addEventListener("keydown", skip)
    window.addEventListener("pointerdown", skip)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener("keydown", skip)
      window.removeEventListener("pointerdown", skip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === "gone") return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end bg-[var(--void)] p-6 md:p-12"
      style={{
        transition: "clip-path 600ms cubic-bezier(0.76,0,0.24,1), opacity 600ms ease",
        clipPath: phase === "wipe" ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
      }}
      role="status"
      aria-live="polite"
      aria-label="System boot sequence"
    >
      <div className="fx-scan" />
      <div className="w-full max-w-3xl">
        <pre className="mb-6 select-none text-[9px] leading-[1.15] text-[var(--sig-dim)] md:text-[11px]">
{`   ▄▄▄  ▄   ▄ ▄ ▄▄▄  ▄▄▄▄ ▄ ▄▄▄  ▄▄▄
   █▄▄█ ▀▄ ▄▀ █ █  █ █  █ █ █  ▀ █▄▄
   █  █  ▀▄▀  █ ▀▄▄▀ █  █ █ ▀▄▄▄ ▄▄█`}
        </pre>

        <div className="space-y-[3px] text-[11px] md:text-xs">
          {lines.map((l, n) => (
            <div key={n} className="flex items-baseline gap-3">
              <span className="text-[var(--txt-faint)] tnum">
                {String(n).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate text-[var(--txt-dim)]">{l.text}</span>
              <span
                className="tnum"
                style={{ color: l.status === "WARN" ? "var(--alert)" : "var(--sig)" }}
              >
                [{l.status}]
              </span>
            </div>
          ))}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-[var(--sig)]">&gt;</span>
            <span
              className="inline-block h-[13px] w-[7px] align-middle"
              style={{ background: "var(--sig)", animation: "blink 1s steps(1) infinite" }}
            />
          </div>
        </div>

        <p className="label mt-8">press any key to skip</p>
      </div>
    </div>
  )
}
