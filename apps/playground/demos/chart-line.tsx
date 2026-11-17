import { LineChart, Sparkline } from "@kcc/design";

const days = Array.from({ length: 30 }, (_, i) => Date.UTC(2026, 9, 19 + i));
const price = days.map((_, i) => 0.15 + 0.012 * Math.sin(i / 4) - i * 0.0004);
const fmtDay = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function Demo() {
  return (
    <>
      <LineChart
        label="CC price, USD, 30 days to 17 Nov 2026 (sample)"
        series={[{ name: "CC", points: days.map((x, i) => ({ x, y: price[i] })) }]}
        zero={false}
        height="bank"
        xFormat={fmtDay}
        yFormat={(v) => "$" + v.toFixed(3)}
        limits={[{ y: 0.135, label: "Margin call" }]}
        caption="Sample data. Height banked to 45° from the data."
      />
      <p className="kc-note">
        In a sentence: CC <Sparkline label="CC price, 30 days" values={price} format={(v) => "$" + v.toFixed(3)} /> $
        {price[price.length - 1].toFixed(3)}
      </p>
    </>
  );
}
