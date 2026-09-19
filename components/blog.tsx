"use client"

import { Deploy, Section, SectionHead } from "@/components/chrome"
import { TRANSMISSIONS, OPERATOR } from "@/lib/site-data"

/**
 * Transmissions — the writing. Presented as a log of outbound signals rather
 * than a card grid, because four posts in a 3-up grid always leaves an awkward
 * hole. A dense list also lets the titles carry the section.
 */
export default function Blog() {
  return (
    <Section id="blog">
      <SectionHead
        index="05"
        title="TRANSMISSIONS"
        meta={`${TRANSMISSIONS.length} OUTBOUND`}
        blurb="Notes on Angular architecture, where computation belongs, and the things people assume about browsers that turn out not to be true."
      />

      <div className="bracket">
        <div
          className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b px-4 py-2.5 md:px-6"
          style={{ borderColor: "var(--rule)" }}
        >
          <span className="label">ID</span>
          <span className="label">SIGNAL</span>
          <span className="label">DURATION</span>
        </div>

        <ul>
          {TRANSMISSIONS.map((t, i) => (
            <li key={t.id}>
              <Deploy delay={i * 0.06}>
                <a
                  href={t.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-target
                  data-label="READ ON MEDIUM"
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-[rgba(255,176,0,0.04)] md:px-6"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  <span className="label tnum pt-1 text-[var(--sig-dim)]">{t.id}</span>

                  <span className="min-w-0">
                    <span className="glitch font-display block text-sm font-600 uppercase leading-snug tracking-[0.03em] text-[var(--txt)] transition-colors group-hover:text-[var(--sig)] md:text-base">
                      {t.title}
                    </span>
                    <span className="mt-1 block text-[11px] italic text-[var(--txt-faint)]">
                      {t.subtitle}
                    </span>
                    <span className="mt-2.5 block max-w-2xl text-xs leading-relaxed text-[var(--txt-dim)]">
                      {t.excerpt}
                    </span>
                    <span className="mt-3 flex flex-wrap items-center gap-3">
                      <span
                        className="label border px-1.5 py-0.5"
                        style={{ borderColor: "var(--rule)", color: "var(--txt-faint)" }}
                      >
                        {t.channel}
                      </span>
                      <span className="label tnum">{t.date}</span>
                      <span className="label text-[var(--ice-dim)] opacity-0 transition-opacity group-hover:opacity-100">
                        ↗ OPEN
                      </span>
                    </span>
                  </span>

                  <span className="label tnum pt-1">{t.readTime}</span>
                </a>
              </Deploy>
            </li>
          ))}
        </ul>

        <div
          className="flex items-center justify-between border-t px-4 py-3 md:px-6"
          style={{ borderColor: "var(--rule)" }}
        >
          <span className="label">END OF BUFFER</span>
          <a
            href={OPERATOR.links.medium}
            target="_blank"
            rel="noopener noreferrer"
            data-target
            data-label="FULL ARCHIVE"
            className="label transition-colors hover:text-[var(--ice)]"
            style={{ color: "var(--ice-dim)" }}
          >
            FULL ARCHIVE ↗
          </a>
        </div>
      </div>
    </Section>
  )
}
