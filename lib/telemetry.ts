/**
 * One rAF loop for the entire console.
 *
 * Everything that needs per-frame data (the WebGL flow field, the reticle, the
 * status bar) reads from this single source instead of starting its own loop.
 * Continuous values live on a mutable `frame` object that animation code reads
 * directly — no React involved. React-facing consumers subscribe and are
 * notified on a throttle (default 4Hz), because re-rendering a status bar sixty
 * times a second is pure waste.
 */

export type Frame = {
  /** smoothed frames per second */
  fps: number
  /** smoothed frame time, ms */
  ms: number
  /** pointer position in px */
  px: number
  py: number
  /** smoothed pointer position — what the reticle actually chases */
  sx: number
  sy: number
  /** pointer speed, px/frame */
  speed: number
  /** window.scrollY */
  scroll: number
  /** scroll delta per frame, px */
  scrollV: number
  /** 0..1 document scroll progress */
  progress: number
  /** seconds since boot */
  uptime: number
  /** elapsed seconds, for shaders */
  t: number
}

export const frame: Frame = {
  fps: 60,
  ms: 16.7,
  px: 0,
  py: 0,
  sx: 0,
  sy: 0,
  speed: 0,
  scroll: 0,
  scrollV: 0,
  progress: 0,
  uptime: 0,
  t: 0,
}

type Sub = () => void

const subs = new Set<Sub>()
/** Per-frame consumers (render loops). Fired every tick, never throttled. */
const frameSubs = new Set<(f: Frame) => void>()
let running = false
let raf = 0
let start = 0
let last = 0
let lastPublish = 0
let lastScroll = 0
let lastPx = 0
let lastPy = 0

/** React consumers: notified at PUBLISH_HZ, not per frame. */
const PUBLISH_MS = 250

/** A monotonically increasing token so useSyncExternalStore sees a new snapshot. */
let version = 0
export const getVersion = () => version

function onPointer(e: PointerEvent) {
  frame.px = e.clientX
  frame.py = e.clientY
}

function onTouch(e: TouchEvent) {
  const t = e.touches[0]
  if (t) {
    frame.px = t.clientX
    frame.py = t.clientY
  }
}

function tick(now: number) {
  raf = requestAnimationFrame(tick)

  if (!start) {
    start = now
    last = now
    lastPublish = now
  }

  const dt = Math.max(1, now - last)
  last = now

  // Exponential smoothing keeps the readout stable enough to actually read.
  frame.ms += (dt - frame.ms) * 0.1
  frame.fps += (1000 / dt - frame.fps) * 0.1
  frame.t = (now - start) / 1000
  frame.uptime = frame.t

  // pointer smoothing + speed
  frame.sx += (frame.px - frame.sx) * 0.18
  frame.sy += (frame.py - frame.sy) * 0.18
  const dx = frame.px - lastPx
  const dy = frame.py - lastPy
  lastPx = frame.px
  lastPy = frame.py
  const raw = Math.hypot(dx, dy)
  frame.speed += (raw - frame.speed) * 0.15

  // scroll
  const y = window.scrollY || 0
  frame.scrollV += (y - lastScroll - frame.scrollV) * 0.2
  lastScroll = y
  frame.scroll = y
  const max = document.documentElement.scrollHeight - window.innerHeight
  frame.progress = max > 0 ? Math.min(1, y / max) : 0

  for (const f of frameSubs) f(frame)

  if (now - lastPublish >= PUBLISH_MS) {
    lastPublish = now
    version++
    for (const s of subs) s()
  }
}

function ensureRunning() {
  if (running || typeof window === "undefined") return
  running = true
  window.addEventListener("pointermove", onPointer, { passive: true })
  window.addEventListener("touchmove", onTouch, { passive: true })
  raf = requestAnimationFrame(tick)
}

function maybeStop() {
  if (subs.size > 0 || frameSubs.size > 0 || !running) return
  running = false
  cancelAnimationFrame(raf)
  window.removeEventListener("pointermove", onPointer)
  window.removeEventListener("touchmove", onTouch)
}

/** Subscribe for throttled React updates. Returns an unsubscribe. */
export function subscribe(fn: Sub) {
  subs.add(fn)
  ensureRunning()
  return () => {
    subs.delete(fn)
    maybeStop()
  }
}

/**
 * Register a render callback fired every frame (not throttled). This is how
 * the WebGL field and the reticle draw without starting rAF loops of their own.
 * Returns an unsubscribe.
 */
export function onFrame(fn: (f: Frame) => void) {
  frameSubs.add(fn)
  ensureRunning()
  return () => {
    frameSubs.delete(fn)
    maybeStop()
  }
}

/* ---------------------------------------------------------------- formatting */

export const hex = (n: number, pad = 2) =>
  "0x" + Math.round(n).toString(16).toUpperCase().padStart(pad, "0")

export const bin = (n: number, pad = 8) =>
  Math.round(n).toString(2).padStart(pad, "0")

export function clockFrom(seconds: number) {
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(h)}:${p(m)}:${p(s)}`
}

/** Best-effort GPU string — used purely as a readout curiosity. */
export function gpuString(): string {
  try {
    const c = document.createElement("canvas")
    const gl = c.getContext("webgl") as WebGLRenderingContext | null
    if (!gl) return "NO WEBGL"
    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    if (!ext) return "MASKED"
    const r = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
    return (r || "UNKNOWN").replace(/\s*\([^)]*\)\s*/g, " ").trim().slice(0, 42)
  } catch {
    return "UNKNOWN"
  }
}
