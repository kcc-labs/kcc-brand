import { Pill } from "@kcc/design";

export default function Demo() {
  return (
    <p style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Pill tone="up">OK</Pill>
      <Pill tone="watch">Watch</Pill>
      <Pill tone="down">Margin call</Pill>
      <Pill tone="neutral">Closed</Pill>
      <Pill tone="sample">Sample data</Pill>
    </p>
  );
}
