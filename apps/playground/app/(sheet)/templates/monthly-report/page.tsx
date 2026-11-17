import type { Metadata } from "next";
import {
  ClassMark,
  DataTable,
  Diff,
  Disclaimer,
  DocMeta,
  Figures,
  Footer,
  Logo,
  Masthead,
  Page,
  PageTitle,
  Phases,
  Pill,
  Section,
  StackedArea,
  usdCompact,
  type DocInfo,
} from "@kcc/design";
import { mix } from "@/lib/sample";

export const metadata: Metadata = { title: "Monthly monitoring report" };

const doc: DocInfo = {
  number: "KCC-MR-2026-11",
  version: "1.0",
  date: "1 Dec 2026",
  title: "Monthly monitoring report · November 2026",
  classification: "confidential",
  recipient: "Sample Pool operator",
  status: "Final",
};

const watch = [
  { item: "Debt within 10% of liquidation", now: "4.1%", limit: "10%", status: <Pill tone="up">OK</Pill> },
  { item: "USDCx utilisation", now: "86%", limit: "90%", status: <Pill tone="watch">Watch</Pill> },
  { item: "Depth within 2%, CC", now: "18.0M", limit: "15.0M", status: <Pill tone="watch">Watch</Pill> },
  { item: "Oracle disagreement events", now: "0", limit: "1", status: <Pill tone="up">OK</Pill> },
];

/** Template: a monthly monitoring report for a client, as a web page (not sheets): figures, watchlist, charts, changes. */
export default function MonthlyReport() {
  return (
    <Page>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 13, marginBottom: 13 }}>
        <Logo name="kcc-lockup" height={34} />
        <ClassMark level={doc.classification} recipient={doc.recipient} />
      </div>
      <Masthead left="KC&C · Monitoring" right="November 2026" />
      <PageTitle
        title="November: limits held; two measures on watch"
        lede="No breach this month. USDCx utilisation and CC depth moved toward their limits, so both are on watch for December. All figures are sample data."
      />
      <DocMeta doc={doc} />

      <Section id="mr-month" eyebrow="The month, 30 Nov 2026" title="Coverage up, no bad debt">
        <Figures
          compact
          items={[
            { value: "2.6×", label: "collateral coverage", basis: <>median, <Diff tone="up">+0.2×</Diff> on October</> },
            { value: "$0", label: "bad debt", basis: "realised in the month" },
          ]}
        />
      </Section>

      <Section id="mr-watch" eyebrow="Watchlist against the limits you set" title="Two measures within 20% of their limit">
        <DataTable
          label="Watchlist: measure, value at 30 Nov, limit, status"
          rows={watch}
          rowKey={(r) => r.item}
          rowHeader={(r) => r.item}
          rowHeaderLabel="Measure"
          columns={[
            { header: "30 Nov", cell: (r) => r.now },
            { header: "Limit", cell: (r) => r.limit },
            { header: "Status", text: true, cell: (r) => r.status },
          ]}
        />
      </Section>

      <Section id="mr-mix" eyebrow="Collateral by asset, million USD, weekly" title="CC is still half of the collateral">
        <StackedArea label="Collateral by asset, million USD, 26 weeks (sample)" x={mix.x} layers={mix.layers} xFormat={(i) => `W${20 + i}`} yFormat={(v) => usdCompact(v * 1e6)} />
      </Section>

      <Section id="mr-changes" eyebrow="Parameter changes in the month" title="Three changes, all tightening">
        <Phases
          items={[
            { when: "4 Nov, 09:00", what: "CC loan-to-value 62% → 60%, after 30-day volatility rose above 70%." },
            { when: "12 Nov, 14:00", what: "CC supply cap 22M → 21M, after depth fell below 20M." },
            { when: "27 Nov, 10:00", what: "Liquidation bonus 8% → 9%, after two slow liquidations." },
          ]}
        />
      </Section>

      <Footer>
        <Disclaimer>
          <p>
            Prepared by KC&amp;C for the named recipient only. Figures are sample data for the design system. KC&amp;C publishes data and does not lend; this
            report is not advice. Document {doc.number}, version {doc.version}.
          </p>
        </Disclaimer>
      </Footer>
    </Page>
  );
}
