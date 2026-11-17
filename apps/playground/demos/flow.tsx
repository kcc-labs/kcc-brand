import { Flow } from "@kcc/design";

export default function Demo() {
  return (
    <Flow
      label="How a parameter update travels"
      steps={[
        { title: "KC&C", body: "Computes parameters each hour from CC volatility and order-book depth." },
        { title: "Signed report", body: "Loosening needs two KC&C keys. Tightening needs one." },
        { title: "Your receiver", body: "Applies only values inside your bounds and step.", yours: true },
        { title: "Your pool", body: "Reads the applied values. Your oracle stays your price.", yours: true },
      ]}
    />
  );
}
