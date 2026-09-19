"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { NAV, PROJECTS, TRANSMISSIONS, OPERATOR } from "@/lib/site-data"


/**
 * ⌘K command palette. It genuinely navigates — every entry resolves to a real
 * section, project, or external link.
 *
 * Matching is a subsequence scorer (the same shape editors use): characters
 * must appear in order, consecutive runs and word-boundary hits score higher.
 * Good enough that "gng" finds "Graph NG" and "wrk" finds the Web Workers post.
 */

type Cmd = {
  id: string
  label: string
  group: string
  hint?: string
  run: () => void
}

function score(query: string, text: string): number {
  if (!query) return 1
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let qi = 0
  let s = 0
  let run = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      run++
      s += run * 2
      // word-boundary bonus
      if (ti === 0 || t[ti - 1] === " " || t[ti - 1] === "-" || t[ti - 1] === "/") s += 6
      qi++
    } else {
      run = 0
    }
  }
  return qi === q.length ? s : 0
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)


  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const commands = useMemo<Cmd[]>(() => {
    const nav: Cmd[] = NAV.map((n) => ({
      id: `nav-${n.id}`,
      label: n.label,
      group: "NAVIGATE",
      hint: `§${n.index}`,
      run: () => go(n.id),
    }))

    const projects: Cmd[] = PROJECTS.map((p) => ({
      id: `proj-${p.id}`,
      label: p.title,
      group: "MODULES",
      hint: p.id,
      run: () => {
        go("projects")
        window.setTimeout(() => {
          document.querySelector<HTMLElement>(`[data-module="${p.id}"]`)?.click()
        }, 650)
      },
    }))

    const posts: Cmd[] = TRANSMISSIONS.map((t) => ({
      id: `tx-${t.id}`,
      label: t.title,
      group: "TRANSMISSIONS",
      hint: t.readTime,
      run: () => window.open(t.link, "_blank", "noopener,noreferrer"),
    }))

    const actions: Cmd[] = [
      {
        id: "act-resume",
        label: "Download dossier — résumé (PDF)",
        group: "ACTIONS",
        hint: "PDF",
        run: () => {
          const a = document.createElement("a")
          a.href = OPERATOR.resume
          if (OPERATOR.resume.startsWith("/")) a.download = ""
          else {
            a.target = "_blank"
            a.rel = "noopener noreferrer"
          }
          a.click()
        },
      },
      {
        id: "act-mail",
        label: "Open uplink — email",
        group: "ACTIONS",
        hint: "MAIL",
        run: () => {
          window.location.href = `mailto:${OPERATOR.email}`
        },
      },
      {
        id: "act-li",
        label: "LinkedIn profile",
        group: "ACTIONS",
        hint: "EXT",
        run: () => window.open(OPERATOR.links.linkedin, "_blank", "noopener,noreferrer"),
      },
      {
        id: "act-medium",
        label: "Medium archive",
        group: "ACTIONS",
        hint: "EXT",
        run: () => window.open(OPERATOR.links.medium, "_blank", "noopener,noreferrer"),
      },
      {
        id: "act-wire",
        label: "Toggle wireframe render mode",
        group: "ACTIONS",
        hint: "VIEW",
        run: () => {
          const b = document.body
          if (b.dataset.mode === "wireframe") delete b.dataset.mode
          else b.dataset.mode = "wireframe"
        },
      },
      {
        id: "act-top",
        label: "Return to origin",
        group: "ACTIONS",
        hint: "HOME",
        run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
    ]

    return [...nav, ...projects, ...posts, ...actions]
  }, [go])

  const results = useMemo(() => {
    if (!q.trim()) return commands
    return commands
      .map((c) => ({ c, s: Math.max(score(q, c.label), score(q, c.group) * 0.3) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.c)
  }, [q, commands])

  useEffect(() => setActive(0), [q])

  // global hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (e.key === "Escape") setOpen(false)
      // bare "/" opens it too, as long as you aren't typing somewhere
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQ("")
      window.setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // keep the active row in view
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (i + 1) % Math.max(results.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const c = results[active]
      if (c) {
        setOpen(false)
        c.run()
      }
    }
  }

  if (!open) return null

  let lastGroup = ""

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "rgba(3,4,6,0.78)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="bracket w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "none" }}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--rule)" }}>
          <span className="text-[var(--sig)]">&gt;</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="search modules, sections, transmissions…"
            aria-label="Search commands"
            className="w-full bg-transparent text-sm text-[var(--txt)] outline-none placeholder:text-[var(--txt-faint)]"
          />
          <kbd className="label border px-1.5 py-0.5" style={{ borderColor: "var(--rule)" }}>
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1" role="listbox">
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-[var(--txt-faint)]">
              no matching command — signal lost
            </p>
          )}
          {results.map((c, i) => {
            const head = c.group !== lastGroup ? ((lastGroup = c.group), c.group) : null
            return (
              <div key={c.id}>
                {head && (
                  <div className="label px-4 pb-1 pt-3">{head}</div>
                )}
                <button
                  data-idx={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    setOpen(false)
                    c.run()
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors"
                  style={{
                    background: i === active ? "rgba(255,176,0,0.09)" : "transparent",
                    color: i === active ? "var(--sig)" : "var(--txt-dim)",
                  }}
                >
                  <span
                    className="w-3 shrink-0"
                    style={{ color: i === active ? "var(--sig)" : "transparent" }}
                  >
                    ›
                  </span>
                  <span className="flex-1 truncate">{c.label}</span>
                  {c.hint && <span className="label shrink-0">{c.hint}</span>}
                </button>
              </div>
            )
          })}
        </div>

        <div
          className="flex items-center gap-4 border-t px-4 py-2"
          style={{ borderColor: "var(--rule)" }}
        >
          <span className="label">↑↓ move</span>
          <span className="label">↵ execute</span>
          <span className="label ml-auto">{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  )
}
