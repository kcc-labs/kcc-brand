import { PairedBars, usdCompact } from "@kcc/design";

export default function Demo() {
  return (
    <PairedBars
      label="Interest per year in the simulated pool, USD, today and with software parameters (sample data)"
      series={["Today", "With software parameters"]}
      format={usdCompact}
      rows={[
        { label: "Paid by borrowers", a: 100_000, b: 110_000 },
        { label: "Earned by suppliers", a: 90_000, b: 99_000 },
        { label: "Protocol spread", a: 10_000, b: 11_000 },
      ]}
    />
  );
}
