import { Columns, DivergingBars, Heatmap, Legend, LineChart, PairedBars, ScaleKey, Sparkline, StackedArea, Pill, num, signedPct, usdCompact } from "@kcc/design";
import { burnMint, ccDays, ccPrice, depthNow, depthWeekAgo, heat, mix, shortDate, venues, walk, weeks } from "@/lib/sample";

const price = (v: number) => "$" + v.toFixed(3);

/** Every chart type, drawn from the sample data at `w` px wide. Rendered once per theme on the Colour page. */
export function SampleCharts({ w }: { w: number }) {
  const other = walk(3, 90, 0.139, 0.02, 0.0004);
  return (
    <>
      <p>
        <Pill tone="sample">Sample data</Pill>
      </p>
      <LineChart
        width={w}
        label="CC price, USD, two reference series, 90 days to 17 Nov 2026 (sample)"
        series={[
          { name: "KC&C", points: ccDays.map((x, i) => ({ x, y: ccPrice[i] })) },
          { name: "Feed", points: ccDays.map((x, i) => ({ x, y: other[i] })) },
        ]}
        zero={false}
        xFormat={shortDate}
        yFormat={price}
        limits={[{ y: 0.13, label: "Margin call" }]}
        caption="Line: two series, direct end labels, a dashed limit."
      />
      <Columns
        width={w}
        tone="sign"
        label="Daily change in pool supply, percent, last 21 days (sample)"
        values={ccDays.slice(-21).map((x, i) => ({ label: shortDate(x), value: Math.round((ccPrice[ccPrice.length - 21 + i] / ccPrice[ccPrice.length - 22 + i] - 1) * 1000) / 10 }))}
        format={(v) => signedPct(v, 1)}
        every={5}
        caption="Columns by sign: above zero is better, below is worse; position carries the sign."
      />
      <DivergingBars
        width={w}
        label="Change in borrower capacity by scenario, percent (sample)"
        rows={[
          { label: "Replay", value: 5 },
          { label: "Held-out paths", value: 10 },
          { label: "−30% in a day", value: -15 },
          { label: "Worst week twice", value: 25 },
          { label: "Gap in an hour", value: -0.3 },
        ]}
        caption="Centred-zero bars: side and sign, not colour alone."
      />
      <PairedBars
        width={w}
        label="Order-book depth within 2% by venue, million CC, now and a week ago (sample)"
        series={["A week ago", "Now"]}
        rows={venues.map((v, i) => ({ label: v, a: depthWeekAgo[i], b: depthNow[i] }))}
        format={(v) => num(v, 1)}
        caption="Paired bars: the comparison in neutral, the subject in ink."
      />
      <StackedArea
        width={w}
        label="Collateral by asset, million USD, 26 weeks (sample)"
        x={mix.x}
        layers={mix.layers}
        xFormat={(i) => `W${20 + i}`}
        yFormat={(v) => usdCompact(v * 1e6)}
        legend={<Legend items={mix.layers.map((l, i) => ({ label: l.name, swatch: `kc-c-cat-${i + 1}` }))} />}
        caption="Stacked area: categorical colours 1–4 in order, each layer named at its end."
      />
      <Heatmap
        width={w}
        cell={Math.floor((w - 80) / weeks.length)}
        label="Weekly change in depth by venue, percent (sample)"
        rows={venues}
        cols={weeks}
        values={heat}
        format={(v) => num(v, 0)}
        legend={<ScaleKey scale="diverging" low="−20% worse" high="+20% better" />}
        caption="Heatmap, diverging scale: every cell prints its value in a measured text colour."
      />
      <p className="kc-note">
        Sparkline: burn/mint ratio, 30 days <Sparkline label="Burn/mint ratio, 30 days" values={burnMint} format={(v) => num(v, 2)} />{" "}
        {num(burnMint[burnMint.length - 1], 2)}
      </p>
    </>
  );
}
