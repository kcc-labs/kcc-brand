import type { Metadata } from "next";
import {
  DataTable,
  Diff,
  Disclaimer,
  DocMeta,
  Evidence,
  FnRef,
  Footnotes,
  KeyData,
  LineChart,
  ListBlock,
  Note,
  Pill,
  Section,
  Sheets,
  num,
  signedPct,
  type DocInfo,
} from "@kcc/design";
import { ccDays, ccPrice, depthNow, depthWeekAgo, shortDate, venues } from "@/lib/sample";

export const metadata: Metadata = { title: "Research note" };

const doc: DocInfo = { number: "KCC-RN-2026-014", version: "1.0", date: "17 Nov 2026", title: "Research note · CC market structure", classification: "public", status: "Final" };
const last = ccPrice[ccPrice.length - 1];

/** Template: a two-page research note. Page 1 leads with the finding and key data; page 2 holds method and disclosures. */
export default function ResearchNote() {
  return (
    <Sheets doc={doc}>
      <>
        <p className="kc-eyebrow">
          Research note · Canton Coin market structure <Pill tone="sample">Sample data</Pill>
        </p>
        <h1 className="kc-title">CC depth is thinning while the price rises</h1>
        <DocMeta doc={doc} />
        <div className="kc-note-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: 21, minWidth: 0 }}>
            <p className="kc-lede">
              Order books within 2% of the CC price held 18.0M CC on 17 November, 2% less than a week before, while the price rose over the quarter. Collateral
              limits that depend on depth would tighten slightly.
            </p>
            <ListBlock
              title="Key points"
              items={[
                <>
                  <Evidence kind="F" /> Depth fell at three of five venues in the week.
                  <FnRef n={1} />
                </>,
                <>
                  <Evidence kind="I" /> The fall is concentrated at the venues that grew most in October.
                </>,
                <>
                  <Evidence kind="H" /> Market makers are reducing CC inventory before year end.
                </>,
              ]}
            />
            <LineChart
              width={440}
              height="bank"
              label="CC price, USD, daily close, 90 days to 17 Nov 2026 (sample)"
              series={[{ name: "CC", points: ccDays.map((x, i) => ({ x, y: ccPrice[i] })) }]}
              zero={false}
              xFormat={shortDate}
              yFormat={(v) => "$" + v.toFixed(3)}
              caption="Figure 1. CC price, USD, daily close. Source: KC&C reference price (sample)."
            />
          </div>
          <aside>
            <KeyData
              title="Key data"
              rows={[
                ["CC price", `$${last.toFixed(4)}`],
                ["Venues", "5"],
                ["Data as of", "17 Nov 2026, 17:00 UTC"],
                ["Next note", "1 Dec 2026"],
              ]}
            />
          </aside>
        </div>
      </>
      <>
        <Section id="rn-venues" eyebrow="Depth within 2% of price, million CC" title="Three of five venues thinned">
          <DataTable
            dense
            label="Depth by venue, now and a week ago"
            rows={venues.map((v, i) => ({ v, now: depthNow[i], wk: depthWeekAgo[i] }))}
            rowKey={(r) => r.v}
            rowHeader={(r) => r.v}
            rowHeaderLabel="Venue"
            columns={[
              { header: "17 Nov", cell: (r) => num(r.now, 1) },
              { header: "10 Nov", cell: (r) => num(r.wk, 1) },
              { header: "Change", cell: (r) => <Diff tone={r.now >= r.wk ? "up" : "down"}>{signedPct((r.now / r.wk - 1) * 100, 0)}</Diff> },
            ]}
            caption="Table 1. Source: KC&C order-book data (sample)."
          />
        </Section>
        <Section id="rn-method" eyebrow="Method" title="How we measure depth">
          <Note>
            Depth is the CC quantity on both sides of each venue&apos;s order book within 2% of the mid price, sampled every minute and averaged over the
            day. Venues are included when they publish full-depth books.
          </Note>
        </Section>
        <Footnotes items={["KC&C order-book data, snapshots 10 and 17 Nov 2026, 17:00 UTC (sample)."]} />
        <div style={{ marginTop: "auto" }}>
          <Disclaimer columns>
            <p>
              This note is published by KC&amp;C for information. It is not investment advice, an offer or a solicitation. KC&amp;C publishes data and does
              not lend, trade or hold positions in CC for its own account.
            </p>
            <p>The views are those of the authors at the date of the note and can change without notice. Data may contain errors; sources are named.</p>
            <p>Labels: [F] fact with a source, [I] our interpretation, [H] hypothesis not yet tested.</p>
            <p>Document KCC-RN-2026-014, version 1.0. Corrections are published as a new version with the change stated.</p>
          </Disclaimer>
        </div>
      </>
    </Sheets>
  );
}
