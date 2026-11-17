import type { Metadata } from "next";
import { DataTable, Disclaimer, DocMeta, Evidence, ListBlock, Pill, RatingAction, Section, Sheets, Tag, TwoColumns, type DocInfo } from "@kcc/design";

export const metadata: Metadata = { title: "Rating report" };

const doc: DocInfo = {
  number: "KCC-RR-2026-021",
  version: "1.0",
  date: "17 Nov 2026",
  title: "mero rating report · Sample Pool",
  classification: "confidential",
  recipient: "Sample Pool operator",
  status: "Final",
  brand: "mero-lockup",
};

const metrics = [
  { m: "Collateral coverage, median", v: "2.6×", prev: "2.4×", basis: "Positions, 17 Nov 2026" },
  { m: "Debt within 10% of liquidation", v: "4.1%", prev: "6.8%", basis: "Share of debt" },
  { m: "Depth within 2%, CC", v: "18.0M", prev: "18.4M", basis: "Five venues, daily mean" },
  { m: "Oracle checks", v: "2", prev: "1", basis: "Independent price sources" },
  { m: "Bad debt, 12 months", v: "$0", prev: "$0", basis: "Realised" },
];

/** Template: a rating report. The action box comes first, then rationale, metrics, sensitivities, history and disclosures. */
export default function RatingReport() {
  return (
    <Sheets doc={doc}>
      <>
        <p className="kc-eyebrow">
          Rating action · Lending pool <Pill tone="sample">Sample</Pill>
        </p>
        <h1 className="kc-title">Sample Pool assigned grade B, outlook stable</h1>
        <DocMeta doc={doc} />
        <RatingAction
          items={[
            { label: "Grade", value: "B", grade: true },
            { label: "Outlook", value: "Stable" },
            { label: "Action", value: "Assigned" },
            { label: "Effective", value: "17 Nov 2026" },
            { label: "12-month default band", value: <>0.5–1.5% <Tag>sample</Tag></> },
          ]}
        />
        <Section id="rr-why" eyebrow="Rationale" title="Strong coverage and a second price check; collateral is concentrated in one asset">
          <p>
            <Evidence kind="F" /> Median collateral coverage is 2.6 times debt, and 4.1% of debt sits within 10% of liquidation. <Evidence kind="F" /> Two
            independent price sources gate new borrowing. <Evidence kind="I" /> Collateral is mostly CC, so a fall in CC moves every position together; this
            caps the grade at B.
          </p>
        </Section>
        <Section id="rr-metrics" eyebrow="Key metrics, at 17 Nov 2026 and at the last review" title="Coverage improved; depth slightly lower">
          <DataTable
            dense
            label="Key rating metrics now and at the last review"
            rows={metrics}
            rowKey={(r) => r.m}
            rowHeader={(r) => r.m}
            rowHeaderLabel="Metric"
            columns={[
              { header: "Now", cell: (r) => r.v },
              { header: "Last review", cell: (r) => r.prev },
              { header: "Basis", text: true, cell: (r) => r.basis },
            ]}
          />
        </Section>
      </>
      <>
        <Section id="rr-sens" eyebrow="Sensitivities" title="What would move the grade">
          <TwoColumns>
            <ListBlock title="Up to A" items={["A second collateral asset above 30% of the pool.", "Coverage above 3× through a 30% CC fall in our stress test."]} />
            <ListBlock title="Down to C" items={["Debt within 10% of liquidation above 10%.", "Loss of the second price check.", "Depth within 2% below 10M CC for a month."]} />
          </TwoColumns>
        </Section>
        <Section id="rr-hist" eyebrow="Rating history" title="First rating">
          <DataTable
            dense
            label="Rating history"
            rows={[{ d: "17 Nov 2026", a: "Assigned", g: "B", o: "Stable" }]}
            rowKey={(r) => r.d}
            rowHeader={(r) => r.d}
            rowHeaderLabel="Date"
            columns={[
              { header: "Action", text: true, cell: (r) => r.a },
              { header: "Grade", cell: (r) => r.g },
              { header: "Outlook", text: true, cell: (r) => r.o },
            ]}
          />
        </Section>
        <div style={{ marginTop: "auto" }}>
          <Disclaimer columns>
            <p>
              A mero grade is an opinion on the relative chance of a credit event in the next 12 months, on the scale A to F (X: in default; NR: not rated).
              It is not a recommendation to lend, borrow, buy or sell, and not a guarantee.
            </p>
            <p>Method: mero rating method, version 1. Grades use public data and data the operator chose to share; positions on Canton are private.</p>
            <p>The rated operator saw this report before publication to check facts only. The grade did not change.</p>
            <p>Document KCC-RR-2026-021, version 1.0. Sample report for the design system; the pool and figures are not real.</p>
          </Disclaimer>
        </div>
      </>
    </Sheets>
  );
}
