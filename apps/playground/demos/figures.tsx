import { Diff, Figures } from "@kcc/design";

export default function Demo() {
  return (
    <Figures
      items={[
        { value: "+10%", label: "borrower capacity", basis: "mean over 500 held-out paths, simulated (sample data)" },
        { value: "200 → 198", label: "liquidations per path", basis: "difference within noise" },
        { value: <>8.8% <Diff tone="up">+0.8 pt</Diff></>, label: "supplier yield", basis: "a year, before fees" },
        { value: "$0", label: "bad debt", basis: "in every scenario we ran" },
      ]}
    />
  );
}
