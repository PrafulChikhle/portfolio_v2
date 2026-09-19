"use client"

import { useEffect, useRef } from "react"
import { onFrame } from "@/lib/telemetry"

/**
 * A targeting reticle in place of the pointer.
 *
 * It trails the real cursor on a spring, snaps onto any element carrying
 * `data-target`, and prints that element's `data-label` beside itself. Driven
 * entirely by direct transform writes inside the shared rAF — it never touches
 * React state, so moving the mouse costs zero renders.
 *
 * Only engages for fine pointers (a mouse), and never under reduced motion, so
 * touch users and motion-sensitive users keep the native cursor.
 */
export default function Reticle() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return

    document.body.dataset.reticle = "on"

    let target: HTMLElement | null = null
    let tx = 0
    let ty = 0
    let tw = 0
    let th = 0
    // current interpolated box
    let cx = 0
    let cy = 0
    let cw = 26
    let ch = 26
    let label = ""

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-target]") as HTMLElement | null
      if (el === target) return
      target = el
      if (el) {
        label = el.dataset.label || ""
        if (tag.current) tag.current.textContent = label
      } else {
        label = ""
      }
    }

    window.addEventListener("pointerover", onOver, { passive: true })

    const stop = onFrame((f) => {
      if (target) {
        const r = target.getBoundingClientRect()
        // snap to the target's box, with a little padding
        tx = r.left + r.width / 2
        ty = r.top + r.height / 2
        tw = r.width + 14
        th = r.height + 12
      } else {
        tx = f.px
        ty = f.py
        tw = 26
        th = 26
      }

      // the ring eases toward the box; the dot tracks the raw pointer tightly
      const k = target ? 0.26 : 0.18
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      cw += (tw - cw) * 0.3
      ch += (th - ch) * 0.3

      if (ring.current) {
        ring.current.style.transform = `translate3d(${cx - cw / 2}px, ${cy - ch / 2}px, 0)`
        ring.current.style.width = `${cw}px`
        ring.current.style.height = `${ch}px`
        ring.current.style.opacity = target ? "1" : "0.55"
      }
      if (dot.current) {
        // the dot stretches along the direction of travel — cheap sense of inertia
        const s = Math.min(f.speed * 0.02, 1.1)
        dot.current.style.transform = `translate3d(${f.px - 2}px, ${f.py - 2}px, 0) scale(${1 + s}, ${1 / (1 + s * 0.5)})`
        dot.current.style.opacity = target ? "0" : "1"
      }
      if (tag.current) {
        tag.current.style.transform = `translate3d(${cx + cw / 2 + 10}px, ${cy - 6}px, 0)`
        tag.current.style.opacity = target && label ? "1" : "0"
      }
    })

    return () => {
      stop()
      window.removeEventListener("pointerover", onOver)
      delete document.body.dataset.reticle
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block" aria-hidden="true">
      <div
        ref={ring}
        className="absolute left-0 top-0 border transition-[opacity] duration-200"
        style={{ borderColor: "var(--sig)", willChange: "transform, width, height" }}
      >
        {/* corner ticks, so it reads as a reticle and not a circle */}
        <span className="absolute -left-px -top-px h-1.5 w-1.5 border-l border-t" style={{ borderColor: "var(--sig)" }} />
        <span className="absolute -right-px -top-px h-1.5 w-1.5 border-r border-t" style={{ borderColor: "var(--sig)" }} />
        <span className="absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l" style={{ borderColor: "var(--sig)" }} />
        <span className="absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r" style={{ borderColor: "var(--sig)" }} />
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1 w-1 rounded-full"
        style={{ background: "var(--sig)", boxShadow: "0 0 8px var(--sig-glow)", willChange: "transform" }}
      />
      <div
        ref={tag}
        className="label label-sig absolute left-0 top-0 whitespace-nowrap transition-opacity duration-200"
        style={{ willChange: "transform" }}
      />
    </div>
  )
}
