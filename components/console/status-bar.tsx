"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { frame, subscribe, getVersion, clockFrom, gpuString, hex } from "@/lib/telemetry"

/**
 * The bottom instrument rail — genuinely live numbers, not decorative ones.
 *
 * Reads the shared telemetry frame through useSyncExternalStore, which only
 * notifies at 4Hz, so this whole strip re-renders four times a second no matter
 * how hard the pointer or scroll is being driven.
 */

function Cell({
  k,
  v,
  tone = "dim",
  className = "",
}: {
  k: string
  v: string
  tone?: "dim" | "sig" | "ice"
  className?: string
}) {
  const color =
    tone === "sig" ? "var(--sig)" : tone === "ice" ? "var(--ice)" : "var(--txt-dim)"
  return (
    <div className={`flex items-baseline gap-1.5 whitespace-nowrap ${className}`}>
      <span className="label">{k}</span>
      <span className="tnum text-[10px] font-medium" style={{ color }}>
        {v}
      </span>
    </div>
  )
}

export default function StatusBar() {
  useSyncExternalStore(subscribe, getVersion, () => 0)

  const [nodes, setNodes] = useState(0)
  const [gpu, setGpu] = useState("—")
  const [dims, setDims] = useState("—")
  // Everything derived from the browser is seeded as "—" and filled after mount.
  // Reading navigator during render would make the server and client disagree
  // and throw away the hydrated tree.
  const [ua, setUa] = useState("—")

  useEffect(() => {
    setGpu(gpuString())

    const m = navigator.userAgent.match(/(Firefox|Edg|Chrome|Safari)\/([\d.]+)/)
    setUa(m ? `${m[1].replace("Edg", "Edge")} ${m[2].split(".")[0]}` : "UNKNOWN")

    const measure = () => {
      setNodes(document.getElementsByTagName("*").length)
      setDims(`${window.innerWidth}×${window.innerHeight}`)
    }
    measure()
    const id = window.setInterval(measure, 2000)
    window.addEventListener("resize", measure, { passive: true })
    return () => {
      clearInterval(id)
      window.removeEventListener("resize", measure)
    }
  }, [])

  const fps = Math.round(frame.fps)
  const fpsTone = fps >= 50 ? "sig" : fps >= 30 ? "ice" : "dim"

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-sm"
      style={{ borderColor: "var(--rule)", background: "rgba(6,7,10,0.86)" }}
      role="status"
      aria-label="System telemetry"
    >
      {/* scroll progress, doubling as the rail's top edge */}
      <div
        className="absolute -top-px left-0 h-px"
        style={{
          width: `${frame.progress * 100}%`,
          background: "var(--sig)",
          boxShadow: "0 0 8px var(--sig-glow)",
        }}
      />

      <div className="flex items-center gap-4 overflow-x-auto px-3 py-1.5 md:gap-6 md:px-5">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--sig)", animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          <span className="label label-sig">LIVE</span>
        </div>

        <Cell k="FPS" v={String(fps)} tone={fpsTone as "sig"} />
        <Cell k="FRAME" v={`${frame.ms.toFixed(1)}ms`} />
        <Cell k="SCRL" v={`${(frame.progress * 100).toFixed(0)}%`} />
        <Cell k="VEL" v={`${Math.abs(frame.scrollV).toFixed(0)}px`} className="hidden sm:flex" />
        <Cell k="NODES" v={hex(nodes, 3)} className="hidden md:flex" />
        <Cell k="VIEW" v={dims} className="hidden lg:flex" />
        <Cell k="UP" v={clockFrom(frame.uptime)} tone="ice" />
        <Cell k="AGENT" v={ua} className="hidden xl:flex" />
        <Cell k="GPU" v={gpu} className="hidden 2xl:flex" />

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <span className="label">PALETTE</span>
          <kbd
            className="border px-1.5 py-0.5 text-[10px]"
            style={{ borderColor: "var(--rule-strong)", color: "var(--sig)" }}
          >
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  )
}
