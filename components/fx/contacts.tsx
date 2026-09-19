"use client"

import { useEffect, useRef } from "react"
import { onFrame } from "@/lib/telemetry"

/**
 * Radar contacts — the layer that makes the background feel *watched* rather
 * than merely animated.
 *
 * Sparse targets acquire (brackets close in), track for a while with a live
 * bearing/range readout, then drop (brackets flare out and fade). One contact
 * at a time may go to LOCK, which pins a crosshair and a leader line to it.
 *
 * Deliberately Canvas2D, not DOM: these carry text labels that would cost a
 * layout pass per frame as elements, and not WebGL because a dozen stroked
 * brackets plus glyphs is exactly what a 2D context is good at.
 *
 * Contacts are kept out of a central exclusion zone. Panels are opaque so they
 * occlude this layer anyway, but the hero headline sits directly on the
 * background and contacts drifting behind letterforms would just read as noise.
 */

type Phase = "acquire" | "track" | "drop"

type Contact = {
  x: number // viewport fraction
  y: number
  vx: number
  vy: number
  id: string
  bearing: number
  phase: Phase
  t: number // seconds in current phase
  life: number // seconds to spend tracking
  locked: boolean
}

const HEXID = "0123456789ABCDEF"
const rid = () =>
  "TGT-" + HEXID[(Math.random() * 16) | 0] + HEXID[(Math.random() * 16) | 0]

/**
 * Contacts live in a frame around the edges of the viewport.
 *
 * A radial exclusion around screen centre is not enough: the hero headline is
 * left-aligned, so a contact can clear the centre circle and still land on top
 * of the type. An explicit edge band is the only shape that guarantees the
 * centre column stays clean at every viewport ratio.
 */
const EDGE_X = 0.13
const EDGE_Y = 0.1

const inFrame = (x: number, y: number) =>
  x < EDGE_X || x > 1 - EDGE_X || y < EDGE_Y || y > 1 - EDGE_Y

function placeInFrame(): { x: number; y: number } {
  // pick an edge, then a position along it
  const along = Math.random()
  switch ((Math.random() * 4) | 0) {
    case 0:
      return { x: Math.random() * EDGE_X, y: along }
    case 1:
      return { x: 1 - Math.random() * EDGE_X, y: along }
    case 2:
      return { x: along, y: Math.random() * EDGE_Y }
    default:
      return { x: along, y: 1 - Math.random() * EDGE_Y }
  }
}

function spawn(): Contact {
  const { x, y } = placeInFrame()
  const a = Math.random() * Math.PI * 2
  const speed = 0.004 + Math.random() * 0.008
  return {
    x,
    y,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed * 0.5,
    id: rid(),
    bearing: Math.floor(Math.random() * 360),
    phase: "acquire",
    t: 0,
    life: 5 + Math.random() * 8,
    locked: false,
  }
}

export default function Contacts() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    // A background that never settles is exactly what reduced-motion users are
    // asking not to get.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const small = window.matchMedia("(max-width: 767px)").matches
    const COUNT = small ? 4 : 9

    const contacts: Contact[] = Array.from({ length: COUNT }, () => {
      const c = spawn()
      // stagger so they do not all acquire on the same frame
      c.t = Math.random() * 4
      c.phase = Math.random() < 0.6 ? "track" : "acquire"
      return c
    })

    let dpr = 1
    let W = 0
    let H = 0
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    let visible = !document.hidden
    const onVis = () => {
      visible = !document.hidden
    }
    document.addEventListener("visibilitychange", onVis)

    // colours + font follow the live theme (konami flips these)
    let sig = "#ffb000"
    let ice = "#4fd6ff"
    let font = "monospace"
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement)
      sig = cs.getPropertyValue("--sig").trim() || "#ffb000"
      ice = cs.getPropertyValue("--ice").trim() || "#4fd6ff"
      font = getComputedStyle(document.body).fontFamily || "monospace"
    }
    readTheme()
    const themeWatch = new MutationObserver(readTheme)
    themeWatch.observe(document.body, { attributes: true, attributeFilter: ["data-mode"] })

    let last = 0

    /** corner brackets around a contact, `s` = half-size in px */
    const brackets = (x: number, y: number, s: number, arm: number) => {
      ctx.beginPath()
      // TL
      ctx.moveTo(x - s, y - s + arm); ctx.lineTo(x - s, y - s); ctx.lineTo(x - s + arm, y - s)
      // TR
      ctx.moveTo(x + s - arm, y - s); ctx.lineTo(x + s, y - s); ctx.lineTo(x + s, y - s + arm)
      // BR
      ctx.moveTo(x + s, y + s - arm); ctx.lineTo(x + s, y + s); ctx.lineTo(x + s - arm, y + s)
      // BL
      ctx.moveTo(x - s + arm, y + s); ctx.lineTo(x - s, y + s); ctx.lineTo(x - s, y + s - arm)
      ctx.stroke()
    }

    const stop = onFrame((f) => {
      if (!visible) return
      const dt = Math.min(0.05, last ? f.t - last : 0.016)
      last = f.t

      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 1

      let lockedCount = contacts.filter((c) => c.locked).length

      for (const c of contacts) {
        c.t += dt
        c.x += c.vx * dt
        c.y += c.vy * dt

        // gentle wander so tracks are not straight lines
        c.vx += (Math.random() - 0.5) * 0.0008
        c.vy += (Math.random() - 0.5) * 0.0004
        c.bearing = (c.bearing + dt * 6) % 360

        // phase machine
        if (c.phase === "acquire" && c.t > 1.1) {
          c.phase = "track"
          c.t = 0
          if (lockedCount === 0 && Math.random() < 0.4) {
            c.locked = true
            lockedCount++
          }
        } else if (c.phase === "track" && c.t > c.life) {
          c.phase = "drop"
          c.t = 0
        } else if (c.phase === "drop" && c.t > 0.9) {
          Object.assign(c, spawn())
          continue
        }

        // respawn if it wanders off screen
        if (c.x < -0.05 || c.x > 1.05 || c.y < -0.05 || c.y > 1.05) {
          Object.assign(c, spawn())
          continue
        }

        // drifted into the content column — drop it rather than let it sit on
        // top of the copy
        if (c.phase !== "drop" && !inFrame(c.x, c.y)) {
          c.phase = "drop"
          c.t = 0
        }

        const px = c.x * W
        const py = c.y * H

        // phase-driven bracket size + alpha
        let s: number
        let alpha: number
        if (c.phase === "acquire") {
          const k = Math.min(1, c.t / 1.1)
          const e = 1 - Math.pow(1 - k, 3)
          s = 34 - 20 * e
          alpha = 0.16 + 0.5 * e
        } else if (c.phase === "track") {
          s = 14 + Math.sin(f.t * 2 + c.x * 10) * 0.8
          alpha = 0.62
        } else {
          const k = Math.min(1, c.t / 0.9)
          s = 14 + 26 * k
          alpha = 0.62 * (1 - k)
        }

        const color = c.locked ? ice : sig
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.fillStyle = color

        brackets(px, py, s, c.phase === "acquire" ? 9 : 5)

        // centre mark
        ctx.globalAlpha = alpha * 0.9
        if (c.locked) {
          ctx.beginPath()
          ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py)
          ctx.moveTo(px, py - 6); ctx.lineTo(px, py + 6)
          ctx.stroke()
        } else {
          ctx.fillRect(px - 1, py - 1, 2, 2)
        }

        // readout, only once settled so acquiring targets stay quiet
        if (c.phase === "track") {
          ctx.globalAlpha = alpha * 0.85
          ctx.font = `9px ${font}`
          ctx.textBaseline = "middle"
          /**
           * Labels point away from the centre column: a contact in the left
           * band labels to its left, everything else to its right, flipping
           * back if that would run past the viewport edge. Pointing inward
           * would poke the text into the body copy it is meant to frame.
           */
          const LABEL_W = 62
          const alignRight = c.x < 0.2 || px + s + 7 + LABEL_W > W
          ctx.textAlign = alignRight ? "right" : "left"
          const lx = alignRight ? px - s - 7 : px + s + 7
          ctx.fillText(c.id, lx, py - 5)
          ctx.globalAlpha = alpha * 0.5
          ctx.fillText(
            `BRG ${String(Math.floor(c.bearing)).padStart(3, "0")}`,
            lx,
            py + 6
          )
          ctx.textAlign = "left"

          // leader line out to the nearest vertical edge for locked contacts
          if (c.locked) {
            const toLeft = px < W / 2
            ctx.globalAlpha = alpha * 0.22
            ctx.beginPath()
            ctx.moveTo(toLeft ? px - s - 4 : px + s + 4, py)
            ctx.lineTo(toLeft ? 0 : W, py)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
    })

    return () => {
      stop()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVis)
      themeWatch.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
