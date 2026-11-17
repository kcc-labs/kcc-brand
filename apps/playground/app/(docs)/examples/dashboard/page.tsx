import type { Metadata } from "next";
import {
  Columns,
  DataTable,
  Diff,
  Figures,
  Footer,
  Grid,
  Heatmap,
  Legend,
  LineChart,
  Masthead,
  Note,
  PageTitle,
  Pill,
  ScaleKey,
  Section,
  Sparkline,
  StackedArea,
  num,
  signedPct,
  usdCompact,
} from "@kcc/design";
import { burnMint, ccDays, ccPrice, depthNow, depthWeekAgo, heat, mix, shortDate, venues, walk, weeks } from "@/lib/sample";

export const metadata: Metadata = { title: "Example: data dashboard" };

const last = ccPrice[ccPrice.length - 1];
const weekAgo = ccPrice[ccPrice.length - 8];
const change7 = (last / weekAgo - 1) * 100;
const returns = ccPrice.slice(-31).slice(1).map((p, i) => Math.log(p / ccPrice[ccPrice.length - 31 + i]));
const vol30 = Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length) * Math.sqrt(365) * 100;
const depthTotal = depthNow.reduce((a, b) => a + b, 0);
const depthTotalWk = depthWeekAgo.reduce((a, b) => a + b, 0);
// Weekly change over the last 12 full weeks (12 x 7 = 84 days fit in the 90-day series).
const weekly = Array.from({ length: 12 }, (_, i) => {
  const end = ccPrice.length - 1 - (11 - i) * 7;
  return { label: `W${34 + i}`, value: Math.round((ccPrice[end] / ccPrice[end - 7] - 1) * 1000) / 10 };
});
const upWeeks = weekly.filter((w) => w.value > 0).length;
const venueSeries = venues.map((_, i) => walk(40 + i, 30, depthNow[i], 0.05));

const status = (now: number, before: number) => {
  const c = (now / before - 1) * 100;
  return c <= -15 ? <Pill tone="down">Thin</Pill> : c <= -5 ? <Pill tone="watch">Watch</Pill> : <Pill tone="up">OK</Pill>;
};

export default function Dashboard() {
  return (
    <article style={{ marginTop: 34 }}>
      <Masthead left="KC&C · CC market monitor" right={<>Sample data · as of 17 Nov 2026, 17:00 UTC</>} />
      <PageTitle app title="CC market, last 90 days" lede="Price, volatility and order-book depth that set collateral limits. Every number on this page is sample data generated for the design system." />

      <Section id="d-now" eyebrow="Now, against a week ago" title={`Price ${change7 >= 0 ? "up" : "down"} ${signedPct(change7, 1).replace(/^[+\u2212]/, "")} in a week, depth ${depthTotal >= depthTotalWk ? "up" : "down"}: ${depthTotal >= depthTotalWk ? "limits hold" : "limits would tighten slightly"}`}>
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

      <Section id="d-price" eyebrow="Price, USD, daily close" title={`CC rose in ${upWeeks} of the last 12 weeks`}>
        <Grid>
          <div className="kc-col-8">
            <LineChart
              width={600}
              height="bank"
              label="CC price, USD, daily close, 90 days to 17 Nov 2026 (sample)"
              series={[{ name: "CC", points: ccDays.map((x, i) => ({ x, y: ccPrice[i] })) }]}
              zero={false}
              area
              xFormat={shortDate}
              yFormat={(v) => "$" + v.toFixed(3)}
              caption="Height banked to 45° from the data."
            />
          </div>
          <div className="kc-col-4">
            <Columns
              width={300}
              height={233}
              tone="sign"
              label="Weekly price change, percent, last 12 weeks (sample)"
              values={weekly}
              format={(v) => signedPct(v, 1)}
              every={4}
              caption="Weekly change; sign and side carry the meaning."
            />
          </div>
        </Grid>
      </Section>

      <Section id="d-depth" eyebrow="Order-book depth within 2% of price, million CC" title="Two venues thinned this week">
        <DataTable
          dense
          label="Depth by venue, now and a week ago, with 30-day trend and status"
          rows={venues.map((v, i) => ({ v, now: depthNow[i], wk: depthWeekAgo[i], series: venueSeries[i] as number[] | null }))}
          rowKey={(r) => r.v}
          rowHeader={(r) => r.v}
          rowHeaderLabel="Venue"
          groups={[
            { label: "", span: 1 },
            { label: "Depth, M CC", span: 3 },
            { label: "", span: 2 },
          ]}
          columns={[
            { header: "Now", cell: (r) => num(r.now, 1) },
            { header: "Week ago", cell: (r) => num(r.wk, 1) },
            { header: "Change", cell: (r) => { const c = (r.now / r.wk - 1) * 100; return <Diff tone={c >= 0 ? "up" : "down"}>{signedPct(c, 0)}</Diff>; } },
            { header: "30 days", cell: (r) => (r.series ? <Sparkline label={`${r.v} depth, 30 days`} values={r.series} width={89} height={21} format={(v) => num(v, 1)} /> : null) },
            { header: "Status", text: true, cell: (r) => status(r.now, r.wk) },
          ]}
          total={{ v: "All venues", now: depthTotal, wk: depthTotalWk, series: null }}
        />
        <Heatmap
          label="Weekly change in depth by venue and week, percent (sample)"
          rows={venues}
          cols={weeks}
          values={heat}
          format={(v) => num(v, 0)}
          legend={<ScaleKey scale="diverging" low="−20%: thinner" high="+20%: deeper" />}
          caption="Each cell prints its value; the colour only repeats it."
        />
      </Section>

      <Section id="d-mix" eyebrow="Collateral in the pools, million USD, weekly" title="CC is still half of all collateral">
        <StackedArea
          label="Collateral by asset, million USD, 26 weeks (sample)"
          x={mix.x}
          layers={mix.layers}
          xFormat={(i) => `W${20 + i}`}
          yFormat={(v) => usdCompact(v * 1e6)}
          legend={<Legend items={mix.layers.map((l, i) => ({ label: l.name, swatch: `kc-c-cat-${i + 1}` }))} />}
        />
        <Note>Sample data. Real monitors take depth from KC&amp;C order-book data and collateral from the pools&apos; public endpoints, with the snapshot time on every figure.</Note>
      </Section>

      <Footer>
        <p>KC&amp;C publishes data and does not lend. Sample data, generated for the design system.</p>
      </Footer>
    </article>
  );
}
