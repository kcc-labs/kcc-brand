import { Phases, Pill } from "@kcc/design";

export default function Demo() {
  return (
    <Phases
      items={[
        { when: "Week 0", what: "Call to agree scope, bounds and the data you can share.", status: <Pill tone="up">Done</Pill> },
        { when: "Weeks 1–4", what: "Shadow run. Daily parameters, a weekly note. Nothing touches your pool.", status: <Pill tone="watch">In progress</Pill>, now: true },
        { when: "Week 4", what: "Test receiver on a test network, with your bounds.", status: <Pill>Planned</Pill> },
        { when: "After", what: "You decide whether to apply the values in production." },
      ]}
    />
  );
}
