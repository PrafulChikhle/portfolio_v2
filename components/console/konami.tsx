"use client"

import { useEffect, useState } from "react"
import { OPERATOR } from "@/lib/site-data"

const SEQ = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
]

/**
 * Konami code → wireframe render mode (the styling lives in globals.css under
 * body[data-mode="wireframe"]). Also prints the devtools banner, because the
 * people most likely to try the konami code are the people most likely to have
 * the console open.
 */
export default function Konami() {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // devtools banner — for whoever opens the inspector
    const style = "color:#ffb000;font-family:monospace;"
    console.log(
      "%c" +
        [
          "",
          "   ▄▄▄  ▄   ▄ ▄ ▄▄▄  ▄▄▄▄ ▄ ▄▄▄  ▄▄▄",
          "   █▄▄█ ▀▄ ▄▀ █ █  █ █  █ █ █  ▀ █▄▄",
          "   █  █  ▀▄▀  █ ▀▄▄▀ █  █ █ ▀▄▄▄ ▄▄█",
          "",
          "   You opened the inspector. Good instinct.",
          "",
          "   Everything here is hand-written: the contour field is one",
          "   fragment shader, the whole page shares a single rAF, and the",
          "   terminal in the uplink section is a real REPL. Try `help`.",
          "",
          `   Hiring, or just want to compare notes? ${OPERATOR.email}`,
          "",
        ].join("\n"),
      style
    )
    console.log("%cTry the Konami code. ↑↑↓↓←→←→BA", "color:#4fd6ff;font-family:monospace;")

    let i = 0
    const onKey = (e: KeyboardEvent) => {
      const want = SEQ[i]
      const got = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (got === want) {
        i++
        if (i === SEQ.length) {
          i = 0
          const b = document.body
          const on = b.dataset.mode === "wireframe"
          if (on) {
            delete b.dataset.mode
            setToast("RENDER MODE → STANDARD")
          } else {
            b.dataset.mode = "wireframe"
            setToast("RENDER MODE → WIREFRAME")
          }
          window.setTimeout(() => setToast(null), 2600)
        }
      } else {
        i = got === SEQ[0] ? 1 : 0
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!toast) return null

  return (
    <div
      className="bracket fixed bottom-14 left-1/2 z-[95] -translate-x-1/2 px-5 py-2.5"
      role="status"
      aria-live="polite"
    >
      <span className="label label-sig">{toast}</span>
    </div>
  )
}
