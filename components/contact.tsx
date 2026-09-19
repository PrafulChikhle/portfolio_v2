"use client"

import { useState } from "react"
import { Deploy, Section, SectionHead } from "@/components/chrome"
import Terminal from "@/components/console/terminal"
import { OPERATOR } from "@/lib/site-data"


/**
 * Uplink.
 *
 * The form is deliberately honest: this is a static export with no backend, so
 * "send" composes a mailto: rather than pretending to POST somewhere and
 * showing a fake success toast. The terminal beside it is the real interactive
 * surface.
 */

const CHANNELS = [
  // Dossier leads — it is what most visitors are actually after.
  { k: "DOSSIER", v: "resume.pdf ↓", href: OPERATOR.resume },
  { k: "MAIL", v: OPERATOR.email, href: `mailto:${OPERATOR.email}` },
  { k: "VOICE", v: OPERATOR.phone, href: `tel:${OPERATOR.phone.replace(/\s/g, "")}` },
  { k: "STATION", v: OPERATOR.station, href: null },
  { k: "LINKEDIN", v: "praful-chikhle", href: OPERATOR.links.linkedin },
  { k: "MEDIUM", v: "@prafulchikhle2050", href: OPERATOR.links.medium },
  { k: "INSTAGRAM", v: "praful_pr17", href: OPERATOR.links.instagram },
]

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  rows,
  required,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  rows?: number
  required?: boolean
}) {
  const shared =
    "w-full bg-[var(--panel)] px-3 py-2.5 text-xs text-[var(--txt)] outline-none transition-colors placeholder:text-[var(--txt-faint)] focus:border-[var(--sig)]"
  return (
    <label htmlFor={id} className="block">
      <span className="label mb-1.5 block">
        {label}
        {required && <span className="text-[var(--sig)]"> *</span>}
      </span>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-none border`}
          style={{ borderColor: "var(--rule)" }}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} border`}
          style={{ borderColor: "var(--rule)" }}
        />
      )}
    </label>
  )
}

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const body = `${message}\n\n— ${name} (${email})`
    window.location.href = `mailto:${OPERATOR.email}?subject=${encodeURIComponent(
      subject || "Uplink from avionics console"
    )}&body=${encodeURIComponent(body)}`
  }

  return (
    <Section id="contact">
      <SectionHead
        index="06"
        title="UPLINK"
        meta="CHANNEL OPEN"
        blurb="Hiring, comparing notes on visualisation architecture, or just want to argue about where computation belongs — the channel is open."
      />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* channels + form */}
        <div className="lg:col-span-5">
          <Deploy from="left">
            <div className="bracket">
              <div
                className="flex items-center justify-between border-b px-4 py-2.5"
                style={{ borderColor: "var(--rule)" }}
              >
                <span className="label label-sig">CHANNELS</span>
                <span className="label tnum">{CHANNELS.length}</span>
              </div>

              <dl>
                {CHANNELS.map((c) => {
                  const inner = (
                    <>
                      <dt className="label w-24 shrink-0">{c.k}</dt>
                      <dd className="flex-1 truncate text-right text-xs text-[var(--txt-dim)] transition-colors group-hover:text-[var(--sig)]">
                        {c.v}
                      </dd>
                    </>
                  )
                  return c.href ? (
                    <a
                      key={c.k}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      {...(c.k === "DOSSIER" && c.href.startsWith("/")
                        ? { download: "" }
                        : {})}
                      data-target
                      data-label={c.k}
                      className="group flex items-baseline gap-4 border-b px-4 py-3 last:border-b-0 hover:bg-[rgba(255,176,0,0.04)]"
                      style={{ borderColor: "var(--rule-soft)" }}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={c.k}
                      className="group flex items-baseline gap-4 border-b px-4 py-3 last:border-b-0"
                      style={{ borderColor: "var(--rule-soft)" }}
                    >
                      {inner}
                    </div>
                  )
                })}
              </dl>
            </div>
          </Deploy>

          <Deploy from="left" delay={0.08}>
            <form onSubmit={send} className="bracket mt-5 p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="label label-sig">COMPOSE</span>
                <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="c-name" label="CALLSIGN" value={name} onChange={setName} required />
                  <Field
                    id="c-email"
                    label="RETURN ADDR"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                  />
                </div>
                <Field id="c-subject" label="SUBJECT" value={subject} onChange={setSubject} />
                <Field
                  id="c-message"
                  label="PAYLOAD"
                  value={message}
                  onChange={setMessage}
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                data-target
                data-label="COMPOSE MAIL"
                className="sweep group mt-5 w-full border px-5 py-3 text-[11px] tracking-[0.2em] transition-colors"
                style={{ borderColor: "var(--sig)", color: "var(--sig)" }}
              >
                TRANSMIT
                <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <p className="label mt-3 leading-relaxed">
                No backend here — this opens your mail client with the message
                pre-filled. Nothing is sent anywhere else.
              </p>
            </form>
          </Deploy>
        </div>

        {/* terminal */}
        <div className="lg:col-span-7">
          <Deploy from="right" delay={0.06} className="h-full">
            <Terminal />
          </Deploy>
        </div>
      </div>

      {/* footer */}
      <footer
        className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6"
        style={{ borderColor: "var(--rule)" }}
      >
        <span className="label">© {new Date().getFullYear()} {OPERATOR.callsign}</span>
        <span className="label">BUILT WITH NEXT.JS · ONE SHADER · NO UI KIT</span>
        <span className="label ml-auto">AVIONICS v20.50.1</span>
      </footer>
    </Section>
  )
}
