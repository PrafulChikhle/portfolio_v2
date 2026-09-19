"use client"

import { useEffect, useRef, useState } from "react"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#"

type Props = {
  text: string
  /** ms per character before it locks in */
  speed?: number
  /** delay before the resolve starts, ms */
  delay?: number
  /** resolve when scrolled into view rather than on mount */
  onView?: boolean
  /** re-scramble on hover */
  hover?: boolean
  className?: string
  as?: "span" | "h1" | "h2" | "h3" | "div"
}

/**
 * Resolves text out of noise, character by character, left to right.
 *
 * Accessibility: the real string is always present for screen readers via an
 * sr-only node; the animating glyphs are aria-hidden. Under reduced motion the
 * component renders the final text immediately and never animates.
 */
export default function Scramble({
  text,
  speed = 28,
  delay = 0,
  onView = false,
  hover = false,
  className = "",
  as = "span",
}: Props) {
  const [out, setOut] = useState(onView ? "" : text)
  const hostRef = useRef<HTMLElement>(null)
  const rafRef = useRef(0)
  const reducedRef = useRef(false)

  const run = () => {
    if (reducedRef.current) {
      setOut(text)
      return
    }
    const startAt = performance.now() + delay
    const total = text.length
    cancelAnimationFrame(rafRef.current)

    const step = (now: number) => {
      const elapsed = now - startAt
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      const locked = Math.floor(elapsed / speed)
      if (locked >= total) {
        setOut(text)
        return
      }
      let s = text.slice(0, locked)
      for (let i = locked; i < total; i++) {
        // preserve whitespace so the layout never jumps while resolving
        s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setOut(s)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reducedRef.current) {
      setOut(text)
      return
    }

    if (!onView) {
      run()
      return () => cancelAnimationFrame(rafRef.current)
    }

    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, onView])

  const Tag = as as any

  return (
    <Tag
      ref={hostRef}
      className={className}
      onMouseEnter={hover ? run : undefined}
      data-scramble
    >
      <span aria-hidden="true">{out || " "}</span>
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
