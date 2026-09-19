"use client"

import { useEffect, useState } from "react"
import { MotionConfig } from "framer-motion"

import FlowField from "@/components/fx/flow-field"
import Orrery from "@/components/fx/orrery"
import Contacts from "@/components/fx/contacts"
import Reticle from "@/components/fx/reticle"
import Boot from "@/components/fx/boot"
import Konami from "@/components/console/konami"
import CommandPalette from "@/components/console/command-palette"
import StatusBar from "@/components/console/status-bar"

import Header from "@/components/header"
import Hero from "@/components/hero"
import About from "@/components/about"
import Projects from "@/components/projects"
import Skills from "@/components/skills"
import Experience from "@/components/experience"
import Blog from "@/components/blog"
import Contact from "@/components/contact"

export default function Console() {
  // Boot runs once per session, and never for reduced-motion visitors.
  const [booting, setBooting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // sessionStorage throws outright in some privacy configurations — a failed
    // read just means we boot again, which is harmless.
    let seen = false
    try {
      seen = sessionStorage.getItem("avionics:booted") === "1"
    } catch {}
    if (reduced || seen) {
      setReady(true)
      return
    }
    setBooting(true)
  }, [])

  const onBooted = () => {
    try {
      sessionStorage.setItem("avionics:booted", "1")
    } catch {}
    setBooting(false)
    setReady(true)
  }

  return (
    /**
     * reducedMotion="user" is load-bearing, not a nicety. Framer suppresses
     * transform animations for these visitors while still applying the final
     * values, so components can declare `initial`/`animate` unconditionally.
     *
     * Do NOT go back to conditionally omitting those props based on
     * useReducedMotion(): that hook reports `false` during SSR and hydration,
     * so the initial (hidden) style gets applied, and when the hook flips to
     * `true` the props disappear with nothing left to animate the element to
     * its end state — it stays invisible forever.
     */
    <MotionConfig reducedMotion="user">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:border focus:bg-[var(--panel)] focus:px-4 focus:py-2 focus:text-xs focus:text-[var(--sig)]"
      >
        Skip to content
      </a>

      {/* depth stack, far to near: terrain shader, deep field, radar contacts */}
      <FlowField />
      <Orrery />
      <Contacts />

      {/* atmosphere */}
      <div className="fx-vignette" aria-hidden="true" />
      <div className="fx-scan" aria-hidden="true" />
      <div className="fx-sweep-line" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />

      <Reticle />
      <Konami />
      <CommandPalette />

      {booting && <Boot onDone={onBooted} />}

      <div
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 500ms ease 120ms",
        }}
      >
        <Header />

        {/* pb clears the fixed telemetry rail */}
        <main className="relative pb-16">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Experience />
          <Blog />
          <Contact />
        </main>

        <StatusBar />
      </div>
    </MotionConfig>
  )
}
