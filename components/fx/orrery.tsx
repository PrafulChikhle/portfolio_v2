"use client"

import { useEffect, useRef } from "react"
import { onFrame } from "@/lib/telemetry"

/**
 * Deep-field plot: planetary bodies, a distant spiral galaxy, and a starfield.
 *
 * Rendered the way this console would render space — as an instrument plot, not
 * a photograph. Bodies are wireframe: an outline, a lat/long graticule, a
 * terminator crescent, an orbital ring, and a catalogue designation. A photoreal
 * skybox would fight the amber phosphor aesthetic; schematic line-art belongs to
 * it, and stays faint enough to sit behind type.
 *
 * Sits below the radar contacts so the two read as one depth stack: distant
 * bodies far back, tracked contacts near.
 *
 * Perf: planets move at astronomical speeds (i.e. barely), so this redraws at
 * ~20fps rather than 60 — imperceptible, and it leaves the frame budget to the
 * contour shader.
 */

type Body = {
  x: number // viewport fraction
  y: number
  r: number // px radius
  vx: number
  vy: number
  phase: number // terminator, -1..1
  tilt: number // ring/graticule tilt
  ring: boolean
  depth: number // 0..1, drives parallax + brightness
  id: string
}

const DESIGNATIONS = [
  "KEP-186F", "HD-40307G", "GJ-667CC", "TRAPPIST-1E",
  "PSR-B1257", "WASP-121B", "TOI-700D", "K2-18B",
]

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export default function Orrery() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas)

      return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const small = window.matchMedia("(max-width: 767px)").matches

    const BODIES = small ? 2 : 3
    const STARS = small ? 70 : 150

    // ---- world ------------------------------------------------------------
    const used: { x: number; y: number }[] = []
    const bodies: Body[] = Array.from({ length: BODIES }, (_, i) => {
      const depth = rand(0.25, 1)

      // Keep bodies apart. Two discs landing on top of each other read as a
      // rendering glitch, and their labels collide.
      let bx = 0
      let by = 0
      for (let tries = 0; tries < 24; tries++) {
        bx = Math.random() < 0.5 ? rand(-0.14, 0.14) : rand(0.86, 1.14)
        by = rand(0.05, 0.95)
        const clash = used.some(
          (u) => Math.abs(u.x - bx) < 0.3 && Math.abs(u.y - by) < 0.34
        )
        if (!clash) break
      }
      used.push({ x: bx, y: by })

      return {
        /**
         * Mostly off-screen on purpose. A body whose limb enters from the edge
         * reads as vast; one fully in frame reads as a sticker, and its rings
         * sweep straight through the copy.
         */
        x: bx,
        y: by,
        r: rand(46, 120) * (small ? 0.6 : 1),
        vx: rand(-0.004, 0.004),
        vy: rand(-0.002, 0.002),
        phase: rand(-0.85, 0.85),
        tilt: rand(-0.6, 0.6),
        ring: i === 0,
        depth,
        id: DESIGNATIONS[(Math.random() * DESIGNATIONS.length) | 0] + "",
      }
    })

    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: rand(0.4, 1.4),
      a: rand(0.12, 0.6),
      tw: rand(0.4, 2.2), // twinkle rate
      depth: rand(0.2, 1),
    }))

    // a distant spiral galaxy — a logarithmic spiral sampled as dust
    const GAL_N = small ? 90 : 190
    const galaxy = Array.from({ length: GAL_N }, (_, i) => {
      const arm = i % 2
      const t = (i / GAL_N) * 6.6
      const a = t + arm * Math.PI
      const rad = 8 * Math.exp(0.30 * t)
      return {
        dx: Math.cos(a) * rad + rand(-7, 7),
        dy: (Math.sin(a) * rad) * 0.42 + rand(-4, 4), // squashed = inclined disc
        a: Math.max(0.14, 0.7 - t / 11) * rand(0.6, 1),
        s: rand(0.5, 1.6),
      }
    })
    const galPos = { x: small ? 0.82 : 0.93, y: 0.085 }

    // ---- canvas -----------------------------------------------------------
    let W = 0
    let H = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
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

    // ---- drawing ----------------------------------------------------------

    /** lat/long graticule, clipped to the disc */
    const graticule = (cx: number, cy: number, r: number, tilt: number) => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.clip()
      // latitudes: ellipses flattened by tilt
      for (let i = -2; i <= 2; i++) {
        const y = cy + (i / 3) * r
        const rx = r * Math.sqrt(Math.max(0, 1 - (i / 3) ** 2))
        ctx.beginPath()
        ctx.ellipse(cx, y, rx, Math.max(2, rx * Math.abs(tilt) * 0.5), 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      // longitudes
      for (let i = 0; i < 4; i++) {
        const k = (i / 4) * Math.PI
        ctx.beginPath()
        ctx.ellipse(cx, cy, Math.abs(Math.cos(k)) * r, r, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    /** night side, built from the disc arc plus the terminator ellipse */
    const terminator = (cx: number, cy: number, r: number, phase: number) => {
      ctx.save()
      ctx.beginPath()
      const lit = phase >= 0
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !lit)
      ctx.ellipse(cx, cy, r * Math.abs(phase), r, 0, Math.PI / 2, -Math.PI / 2, phase >= 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawBody = (b: Body, t: number, scroll: number) => {
      // parallax: nearer bodies (higher depth) move more with scroll
      const px = b.x * W
      const py = b.y * H - scroll * 120 * b.depth
      const r = b.r

      // cull generously — the ring and label extend past the disc
      if (py < -r * 3 || py > H + r * 3) return

      const alpha = 0.1 + b.depth * 0.16

      ctx.lineWidth = 1
      ctx.strokeStyle = sig
      ctx.globalAlpha = alpha

      // disc
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.stroke()

      ctx.globalAlpha = alpha * 0.45
      graticule(px, py, r, b.tilt)

      // night side
      ctx.globalAlpha = alpha * 1.5
      ctx.fillStyle = "#06070a"
      terminator(px, py, r, Math.sin(t * 0.02 + b.phase * 3) * 0.8)

      // re-stroke the limb so the shaded side keeps its edge
      ctx.globalAlpha = alpha
      ctx.strokeStyle = sig
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.stroke()

      // ring system
      if (b.ring) {
        ctx.globalAlpha = alpha * 0.8
        for (const k of [1.55, 1.78, 1.95]) {
          ctx.beginPath()
          ctx.ellipse(px, py, r * k, r * k * 0.24, b.tilt, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // No wide orbital track: at 2.5x the radius it swept across the vitals
      // and the primary button. The ring system already reads as "planet".

      /**
       * Labels sit on the OUTWARD side of the disc, clamped into the margin.
       * Anchoring them inward (the obvious `px > W/2` test) pushed the
       * catalogue text straight onto the hero copy for any body entering from
       * the left edge.
       */
      ctx.globalAlpha = alpha * 1.6
      ctx.fillStyle = sig
      ctx.font = `9px ${font}`
      const leftSide = px < W * 0.5
      const lx = leftSide
        ? Math.max(10, px - r - 10)
        : Math.min(W - 10, px + r + 10)
      ctx.textAlign = leftSide ? "left" : "right"
      ctx.fillText(b.id, lx, py - 5)
      ctx.globalAlpha = alpha
      ctx.fillText(`R ${Math.round(r * 37)} KM · ${(b.depth * 9.4).toFixed(1)} AU`, lx, py + 7)
      ctx.textAlign = "left"
    }

    const drawGalaxy = (t: number, scroll: number) => {
      const cx = galPos.x * W
      const cy = galPos.y * H - scroll * 40
      if (cy < -340 || cy > H + 340) return
      const rot = reduced ? 0 : t * 0.012
      const cos = Math.cos(rot)
      const sin = Math.sin(rot)

      ctx.fillStyle = ice
      for (const g of galaxy) {
        const x = cx + g.dx * cos - g.dy * sin
        const y = cy + g.dx * sin + g.dy * cos
        ctx.globalAlpha = g.a * 0.75
        ctx.fillRect(x, y, g.s, g.s)
      }
      // core
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40)
      grd.addColorStop(0, "rgba(79,214,255,0.3)")
      grd.addColorStop(1, "rgba(79,214,255,0)")
      ctx.globalAlpha = 1
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, 40, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawStars = (t: number, scroll: number) => {
      ctx.fillStyle = sig
      for (const s of stars) {
        const y = s.y * H - scroll * 60 * s.depth
        const yy = ((y % H) + H) % H // wrap so the field never runs out
        const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(t * s.tw + s.x * 30)
        ctx.globalAlpha = s.a * tw * 0.55
        ctx.fillRect(s.x * W, yy, s.s, s.s)
      }
    }

    // ---- loop -------------------------------------------------------------
    let last = -1
    const INTERVAL = 1 / 20 // 20fps is plenty for objects this slow

    const render = (t: number, scroll: number) => {
      ctx.clearRect(0, 0, W, H)
      drawStars(t, scroll)
      drawGalaxy(t, scroll)
      for (const b of bodies) drawBody(b, t, scroll)
      ctx.globalAlpha = 1
    }

    if (reduced) {
      // one static plot: the depth and atmosphere without any motion
      render(0, 0)
      const onResize = () => {
        resize()
        render(0, 0)
      }
      window.addEventListener("resize", onResize, { passive: true })
      return () => {
        window.removeEventListener("resize", resize)
        window.removeEventListener("resize", onResize)
        document.removeEventListener("visibilitychange", onVis)
        themeWatch.disconnect()
      }
    }

    const stop = onFrame((f) => {
      if (!visible) return
      if (last >= 0 && f.t - last < INTERVAL) return
      const dt = last < 0 ? 0 : f.t - last
      last = f.t

      for (const b of bodies) {
        b.x += b.vx * dt * 0.02
        b.y += b.vy * dt * 0.02
        if (b.x < -0.15) b.x = 1.15
        if (b.x > 1.15) b.x = -0.15
      }

      render(f.t, f.progress)
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
