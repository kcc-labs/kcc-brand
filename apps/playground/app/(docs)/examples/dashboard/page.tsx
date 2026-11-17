import type { Metadata } from "next";
import {
  DataTable,
  Diff,
  Figures,
  Footer,
  LineChart,
  Masthead,
  Note,
  PageTitle,
  Pill,
  Section,
  Sparkline,
  StackedArea,
  num,
  signedPct,
  usdCompact,
} from "@kcc/design";
import { burnMint, ccDays, ccPrice, depthNow, depthWeekAgo, mix, shortDate, venues } from "@/lib/sample";

export const metadata: Metadata = { title: "Example: data dashboard" };

const last = ccPrice[ccPrice.length - 1];
const weekAgo = ccPrice[ccPrice.length - 8];
const change7 = (last / weekAgo - 1) * 100;
const returns = ccPrice.slice(-31).slice(1).map((p, i) => Math.log(p / ccPrice[ccPrice.length - 31 + i]));
const vol30 = Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length) * Math.sqrt(365) * 100;
const depthTotal = depthNow.reduce((a, b) => a + b, 0);
const depthTotalWk = depthWeekAgo.reduce((a, b) => a + b, 0);
const change90 = (last / ccPrice[0] - 1) * 100;

const status = (now: number, before: number) => {
  const c = (now / before - 1) * 100;
  return c <= -15 ? <Pill tone="down">Thin</Pill> : c <= -5 ? <Pill tone="watch">Watch</Pill> : <Pill tone="up">OK</Pill>;
};

export default function Dashboard() {
  return (
    <article style={{ marginTop: 34 }}>
      <Masthead left="KC&C · CC market monitor" right="As of 17 Nov 2026, 17:00 UTC" />
      <PageTitle app title="CC market, last 90 days" lede="Price, volatility and order-book depth that set collateral limits. Every number on this page is sample data generated for the design system." />

      <Section id="d-now" eyebrow="Now, against a week ago" title={`Price ${change7 >= 0 ? "up" : "down"} ${signedPct(change7, 1).replace(/^[+\u2212]/, "")} in a week; ${depthTotal >= depthTotalWk ? "limits hold" : "limits would tighten"}`}>
        <Figures
          compact
          items={[
            { value: <>${last.toFixed(4)}</>, label: "CC price", basis: <>USD, KC&amp;C reference, <Diff tone={change7 >= 0 ? "up" : "down"}>{signedPct(change7, 1)}</Diff> in 7 days</> },
            { value: `${num(vol30, 0)}%`, label: "volatility, 30 days", basis: "annualised, daily log returns" },
            { value: `${num(depthTotal, 1)}M`, label: "depth within 2%", basis: <>CC, five venues, <Diff tone={depthTotal >= depthTotalWk ? "up" : "down"}>{signedPct((depthTotal / depthTotalWk - 1) * 100, 1)}</Diff> in 7 days</> },
            { value: num(burnMint[burnMint.length - 1], 2), label: "burn/mint ratio", basis: <>7-day <Sparkline label="Burn/mint ratio, 30 days" values={burnMint} format={(v) => num(v, 2)} /></> },
          ]}
        />
      </Section>

      <Section id="d-price" eyebrow="Price, USD, daily close" title={`CC ${change90 >= 0 ? "up" : "down"} ${signedPct(change90, 0).replace(/^[+\u2212]/, "")} in 90 days`}>
        <LineChart
          height="bank"
          label="CC price, USD, daily close, 90 days to 17 Nov 2026 (sample)"
          series={[{ name: "CC", points: ccDays.map((x, i) => ({ x, y: ccPrice[i] })) }]}
          zero={false}
          xFormat={shortDate}
          yFormat={(v) => "$" + v.toFixed(3)}
        />
      </Section>

      <Section id="d-depth" eyebrow="Order-book depth within 2% of price, million CC" title="Two venues thinned this week">
        <DataTable
          dense
          label="Depth by venue, now and a week ago, with status"
          rows={venues.map((v, i) => ({ v, now: depthNow[i], wk: depthWeekAgo[i] }))}
          rowKey={(r) => r.v}
          rowHeader={(r) => r.v}
          rowHeaderLabel="Venue"
          columns={[
            { header: "Now", cell: (r) => num(r.now, 1) },
            { header: "Week ago", cell: (r) => num(r.wk, 1) },
            { header: "Change", cell: (r) => { const c = (r.now / r.wk - 1) * 100; return <Diff tone={c >= 0 ? "up" : "down"}>{signedPct(c, 0)}</Diff>; } },
            { header: "Status", text: true, cell: (r) => status(r.now, r.wk) },
          ]}
          total={{ v: "All venues", now: depthTotal, wk: depthTotalWk }}
        />
      </Section>

      <Section id="d-mix" eyebrow="Collateral in the pools, million USD, weekly" title="CC is still half of all collateral">
        <StackedArea
          label="Collateral by asset, million USD, 26 weeks (sample)"
          x={mix.x}
          layers={mix.layers}
          xFormat={(i) => `W${20 + i}`}
          yFormat={(v) => usdCompact(v * 1e6)}
        />
        <Note>Real monitors take depth from KC&amp;C order-book data and collateral from the pools&apos; public endpoints, with the snapshot time on every figure.</Note>
      </Section>

      <Footer>
        <p>KC&amp;C publishes data and does not lend.</p>
      </Footer>
    </article>
  );
}
