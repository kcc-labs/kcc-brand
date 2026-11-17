import { DivergingBars, signedPct } from "@kcc/design";

export default function Demo() {
  return (
    <DivergingBars
      label="Change in borrower capacity with software parameters, by scenario, percent"
      format={(v) => signedPct(v)}
      rows={[
        { label: "Real CC history (replay)", value: 5 },
        { label: "500 resampled paths (held out)", value: 10 },
        { label: "CC −30% in one day", value: -15 },
        { label: "Worst week, twice", value: 25 },
      ]}
      caption="Sample data, simulated, means over each scenario path."
    />
  );
}
