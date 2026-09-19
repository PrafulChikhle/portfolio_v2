"use client"

import { useEffect, useRef, useState } from "react"
import { OPERATOR, PROJECTS, SERVICE_LOG, CAPABILITIES } from "@/lib/site-data"
import { clockFrom, frame, gpuString } from "@/lib/telemetry"

/**
 * A real REPL, not a prop. Commands actually run, history works, tab completes.
 * Lives in the contact section because the conceit is that this is how you
 * address the machine directly.
 */

type Row = { kind: "in" | "out" | "err" | "sys"; text: string }

const BANNER = [
  "avionics shell — type `help` for the command list",
  "",
]

export default function Terminal() {
  const [rows, setRows] = useState<Row[]>(BANNER.map((t) => ({ kind: "sys", text: t })))
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const print = (text: string, kind: Row["kind"] = "out") =>
    setRows((r) => [...r, { kind, text }])

  const printAll = (lines: string[], kind: Row["kind"] = "out") =>
    setRows((r) => [...r, ...lines.map((text) => ({ kind, text }))])

  const COMMANDS: Record<string, { help: string; run: (args: string[]) => void }> = {
    help: {
      help: "list available commands",
      run: () => {
        printAll([
          "",
          ...Object.entries(COMMANDS).map(
            ([name, c]) => `  ${name.padEnd(10)} ${c.help}`
          ),
          "",
        ])
      },
    },
    whoami: {
      help: "print operator record",
      run: () => {
        printAll([
          "",
          `  callsign   ${OPERATOR.callsign}`,
          `  role       ${OPERATOR.role} / ${OPERATOR.rank}`,
          `  posting    ${OPERATOR.employer}`,
          `  station    ${OPERATOR.station}`,
          `  in service since ${OPERATOR.since}`,
          `  contact    ${OPERATOR.email}`,
          "",
        ])
      },
    },
    ls: {
      help: "list modules (ls log | ls skills)",
      run: (args) => {
        const what = args[0]
        if (what === "log") {
          printAll([
            "",
            ...SERVICE_LOG.map(
              (s) => `  ${s.hash}  ${s.duration.padEnd(22)} ${s.position}`
            ),
            "",
          ])
        } else if (what === "skills") {
          printAll([
            "",
            ...CAPABILITIES.flatMap((b) => [
              `  ${b.bank}`,
              ...b.items.map((i) => `    ${String(i.level).padStart(3)}%  ${i.name}`),
            ]),
            "",
          ])
        } else {
          printAll([
            "",
            ...PROJECTS.map((p) => `  ${p.id}  ${p.year}  ${p.title}`),
            "",
            "  try: ls log | ls skills",
            "",
          ])
        }
      },
    },
    open: {
      help: "jump to a section, e.g. `open projects`",
      run: (args) => {
        const id = (args[0] || "").toLowerCase()
        const el = id && document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
          print(`→ navigating to #${id}`)
        } else {
          print(`no such section: ${id || "(none)"}`, "err")
        }
      },
    },
    stat: {
      help: "current render telemetry",
      run: () => {
        printAll([
          "",
          `  fps        ${frame.fps.toFixed(1)}`,
          `  frametime  ${frame.ms.toFixed(2)} ms`,
          `  uptime     ${clockFrom(frame.uptime)}`,
          `  scroll     ${(frame.progress * 100).toFixed(1)}%`,
          `  nodes      ${document.getElementsByTagName("*").length}`,
          `  gpu        ${gpuString()}`,
          "",
        ])
      },
    },
    theme: {
      help: "toggle wireframe render mode",
      run: () => {
        const b = document.body
        if (b.dataset.mode === "wireframe") {
          delete b.dataset.mode
          print("render mode → standard (amber phosphor)")
        } else {
          b.dataset.mode = "wireframe"
          print("render mode → wireframe (ice)")
        }
      },
    },
    resume: {
      help: "download the dossier (PDF)",
      run: () => {
        print(`fetching dossier → ${OPERATOR.resume}`)
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
    contact: {
      help: "open an uplink",
      run: () => {
        print(`opening mail client → ${OPERATOR.email}`)
        window.location.href = `mailto:${OPERATOR.email}`
      },
    },
    clear: {
      help: "clear the buffer",
      run: () => setRows([]),
    },
    sudo: {
      help: "elevate privileges",
      run: () => {
        printAll([
          "",
          `  ${OPERATOR.handle} is not in the sudoers file.`,
          "  This incident has been reported.",
          "",
          "  (it has not been reported)",
          "",
        ], "err")
      },
    },
  }

  // hidden: not in `help`, discoverable by poking around
  const HIDDEN: Record<string, () => void> = {
    coffee: () =>
      printAll([
        "",
        "        ( (",
        "         ) )",
        "      ........",
        "      |      |]",
        "      \\      /",
        "       `----'",
        "",
        "  HTTP 418 — I'm a teapot. Brewing anyway.",
        "",
      ]),
    exit: () => print("nice try. there is no exit from the console."),
  }

  const exec = (raw: string) => {
    const line = raw.trim()
    print(`${OPERATOR.handle}@avionics:~$ ${raw}`, "in")
    if (!line) return

    setHistory((h) => [line, ...h])
    setHIndex(-1)

    const [name, ...args] = line.split(/\s+/)
    const key = name.toLowerCase()

    if (COMMANDS[key]) COMMANDS[key].run(args)
    else if (HIDDEN[key]) HIDDEN[key]()
    else print(`command not found: ${name} — try \`help\``, "err")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(value)
      setValue("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = Math.min(hIndex + 1, history.length - 1)
      if (next >= 0) {
        setHIndex(next)
        setValue(history[next])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = hIndex - 1
      setHIndex(next)
      setValue(next >= 0 ? history[next] : "")
    } else if (e.key === "Tab") {
      e.preventDefault()
      const partial = value.trim().toLowerCase()
      if (!partial) return
      const hit = Object.keys(COMMANDS).find((c) => c.startsWith(partial))
      if (hit) setValue(hit)
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setRows([])
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows])

  const tone = (k: Row["kind"]) =>
    k === "in"
      ? "var(--sig)"
      : k === "err"
      ? "var(--alert)"
      : k === "sys"
      ? "var(--txt-faint)"
      : "var(--txt-dim)"

  return (
    <div className="bracket flex h-full min-h-[380px] flex-col">
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ borderColor: "var(--rule)" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--sig)", animation: "pulse-dot 2s ease-in-out infinite" }}
        />
        <span className="label label-sig">SHELL</span>
        <span className="label ml-auto">TAB completes · ↑ history</span>
      </div>

      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 cursor-text overflow-y-auto px-4 py-3 text-[11px] leading-[1.6] md:text-xs"
      >
        {rows.map((r, i) => (
          <pre
            key={i}
            className="whitespace-pre-wrap break-words font-[inherit]"
            style={{ color: tone(r.kind) }}
          >
            {r.text}
          </pre>
        ))}

        <div className="flex items-center gap-2 pt-1">
          <span className="shrink-0 text-[var(--sig)]">
            {OPERATOR.handle}@avionics:~$
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent text-[var(--txt)] outline-none"
          />
        </div>
      </div>
    </div>
  )
}
