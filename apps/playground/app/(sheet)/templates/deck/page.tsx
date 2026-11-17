import type { Metadata } from "next";
import { DataTable, Diff, DivergingBars, Logo, Pill, signedPct, Slide, type DocInfo } from "@kcc/design";

export const metadata: Metadata = { title: "Deck" };

const doc: DocInfo = { number: "KCC-DK-2026-009", version: "1.0", date: "17 Nov 2026", title: "Risk parameter pilot", classification: "confidential", recipient: "Northwind Capital" };
const TOTAL = 5;

/**
 * Template: a slide deck. One finding a slide, the heading says it, the number is the largest thing.
 * The cover is the only green slide. Slides are 16:9 and scale with the page width.
 */
export default function Deck() {
  return (
    <div className="kc-desk">
      <Slide doc={doc} n={1} total={TOTAL} green section="Pilot proposal">
        <p className="kc-eyebrow" style={{ color: "inherit" }}>
          For Northwind Capital · 17 November 2026
        </p>
        <h1 className="kc-slide__title kc-slide__title--cover">A risk parameter pilot, four weeks in shadow</h1>
      </Slide>

      <Slide doc={doc} n={2} total={TOTAL} section="Result">
        <p className="kc-eyebrow">Borrower capacity, mean over 500 held-out paths, simulated, sample data</p>
        <p className="kc-slide__figure">+10%</p>
        <p className="kc-slide__text">More room to borrow, the same number of liquidations, and no bad debt in any scenario we ran.</p>
      </Slide>

      <Slide doc={doc} n={3} total={TOTAL} section="Every scenario">
        <h2 className="kc-slide__title">Capacity falls only in a sharp one-day crash, by design</h2>
        <DivergingBars
          width={860}
          bar={16}
          gap={8}
          label="Change in borrower capacity by scenario, percent, simulated"
          format={(v) => signedPct(v)}
          rows={[
            { label: "Real CC history (replay)", value: 5 },
            { label: "500 resampled paths", value: 10 },
            { label: "CC −30% in one day", value: -15 },
            { label: "CC −50% over 7 days", value: 15 },
            { label: "Worst week, twice", value: 25 },
          ]}
        />
      </Slide>

      <Slide doc={doc} n={4} total={TOTAL} section="Per year">
        <h2 className="kc-slide__title">A bigger, busier pool at the same risk</h2>
        <DataTable
          label="Per year, simulated pool"
          rows={[
            { i: "Interest paid by borrowers", t: "$100k", s: "$110k", d: <Diff tone="up">+10%</Diff> },
            { i: "Interest earned by suppliers", t: "$90k", s: "$99k", d: <Diff tone="up">+10%</Diff> },
          ]}
          rowKey={(r) => r.i}
          rowHeader={(r) => r.i}
          rowHeaderLabel="Per year, simulated"
          columns={[
            { header: "Today", cell: (r) => r.t },
            { header: "Software", cell: (r) => r.s },
            { header: "Change", cell: (r) => r.d },
          ]}
        />
      </Slide>

      <Slide doc={doc} n={5} total={TOTAL} section="Next step">
        <h2 className="kc-slide__title">A call to agree scope, bounds and data</h2>
        <p className="kc-slide__text">
          Weeks 1–4 run in shadow: nothing touches your pool. <Pill tone="neutral">Indicative</Pill>
        </p>
        <Logo name="kcc-lockup" height={55} />
      </Slide>
    </div>
  );
}
