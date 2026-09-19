"use client"

import { Deploy, Section, SectionHead, CountUp } from "@/components/chrome"
import { OPERATOR, SERVICE_LOG } from "@/lib/site-data"

/**
 * Profile. Two columns of unequal weight: the narrative on the left, a
 * specification table on the right — the same way a real datasheet pairs prose
 * with a parameter block.
 */

const SPEC = [
  { k: "DESIGNATION", v: OPERATOR.role },
  { k: "POSTED TO", v: OPERATOR.employer },
  { k: "GRADE", v: OPERATOR.rank },
  { k: "STATION", v: OPERATOR.station },
  { k: "COMMISSIONED", v: String(OPERATOR.since) },
  { k: "PRIMARY", v: "Angular · TypeScript" },
  { k: "SECONDARY", v: "D3 · PixiJS · WebGL" },
  { k: "SUBSYSTEMS", v: "Node · Go · PostgreSQL" },
  { k: "CLEARANCE", v: "Staff / Architect" },
]

export default function About() {
  return (
    <Section id="about">
      <SectionHead
        index="01"
        title="PROFILE"
        meta="OPERATOR RECORD"
        blurb="Eleven years building the layer where people meet complicated systems — and the component platforms that let other teams do the same."
      />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* narrative */}
        <div className="lg:col-span-7">
          <Deploy from="left">
            <article className="bracket p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="label label-sig">LOG ENTRY</span>
                <span className="h-px flex-1" style={{ background: "var(--rule)" }} />
              </div>

              <p className="text-sm leading-[1.85] text-[var(--txt-dim)] md:text-[15px]">
                It started with wanting to know what was happening behind the screen.
                That curiosity turned into eleven years of shipping enterprise
                frontends — first as the engineer writing the widgets, then as the
                one deciding how the platform underneath them should be shaped.
              </p>

              <p className="mt-5 text-sm leading-[1.85] text-[var(--txt-dim)] md:text-[15px]">
                Most of my work lives where the data is genuinely hard: network graphs
                dense enough to need WebGL, floorplan editors running on a PIXI canvas,
                batch operations streaming in over MQTT, configuration surfaces with more
                states than any mockup ever anticipates. The interesting problem is never
                the component — it is keeping the thing legible at scale.
              </p>

              <p className="mt-5 text-sm leading-[1.85] text-[var(--txt-dim)] md:text-[15px]">
                These days I split my time between architecture decisions, code review,
                and making sure the engineers around me have a platform worth building
                on. I care about clean, maintainable code and about teams where people
                can actually do their best work.
              </p>

              <div
                className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 border-t pt-6"
                style={{ borderColor: "var(--rule)" }}
              >
                <div>
                  <span className="font-display text-3xl font-700 text-[var(--sig)]">
                    <CountUp to={11} />+
                  </span>
                  <span className="label mt-1 block">Years in service</span>
                </div>
                <div>
                  <span className="font-display text-3xl font-700 text-[var(--sig)]">
                    <CountUp to={50} />+
                  </span>
                  <span className="label mt-1 block">Modules shipped</span>
                </div>
                <div>
                  <span className="font-display text-3xl font-700 text-[var(--ice)]">
                    <CountUp to={SERVICE_LOG.length} />
                  </span>
                  <span className="label mt-1 block">Postings</span>
                </div>
              </div>
            </article>
          </Deploy>
        </div>

        {/* spec table */}
        <div className="lg:col-span-5">
          <Deploy from="right" delay={0.08}>
            <div className="bracket">
              <div
                className="flex items-center justify-between border-b px-4 py-2.5"
                style={{ borderColor: "var(--rule)" }}
              >
                <span className="label label-sig">SPECIFICATION</span>
                <span className="label tnum">
                  {String(SPEC.length).padStart(2, "0")} PARAMS
                </span>
              </div>

              <dl>
                {SPEC.map((row, i) => (
                  <div
                    key={row.k}
                    className="group flex items-baseline gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-[rgba(255,176,0,0.04)]"
                    style={{ borderColor: "var(--rule-soft)" }}
                  >
                    <dt className="label tnum w-6 shrink-0 opacity-40">
                      {String(i).padStart(2, "0")}
                    </dt>
                    <dt className="label w-28 shrink-0">{row.k}</dt>
                    <dd className="flex-1 text-right text-xs text-[var(--txt)] transition-colors group-hover:text-[var(--sig)] md:text-[13px]">
                      {row.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Deploy>

          {/* a small radar, purely atmospheric but on-concept */}
          <Deploy from="right" delay={0.16}>
            <div className="bracket mt-6 flex items-center gap-5 p-5">
              <div
                className="relative h-20 w-20 shrink-0 rounded-full border"
                style={{ borderColor: "var(--rule-strong)" }}
              >
                <span
                  className="absolute inset-[22%] rounded-full border"
                  style={{ borderColor: "var(--rule)" }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2"
                  style={{ background: "var(--rule)" }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2"
                  style={{ background: "var(--rule)" }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(255,176,0,0.28) 40deg, transparent 60deg)",
                    animation: "radar 4s linear infinite",
                  }}
                />
              </div>
              <div>
                <p className="label label-sig">CURRENT POSTING</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--txt-dim)]">
                  {SERVICE_LOG[0].position}
                  <br />
                  <span className="text-[var(--txt-faint)]">{SERVICE_LOG[0].company}</span>
                </p>
              </div>
            </div>
          </Deploy>
        </div>
      </div>
    </Section>
  )
}
