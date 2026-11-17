import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import { PageTitle, Section } from "@kcc/design";
import { HtmlSource } from "@/components/HtmlSource";
import Masthead from "@/demos/masthead";
import Title from "@/demos/title";
import SectionDemo from "@/demos/section";
import Figures from "@/demos/figures";
import Table from "@/demos/table";
import Notes from "@/demos/notes";
import Callout from "@/demos/callout";
import Flow from "@/demos/flow";
import Phases from "@/demos/phases";
import Lists from "@/demos/lists";
import Pills from "@/demos/pills";
import Diverging from "@/demos/chart-diverging";
import Paired from "@/demos/chart-paired";
import Line from "@/demos/chart-line";
import Legal from "@/demos/legal";
import Forms from "@/demos/forms";
import NavDemo from "@/demos/nav";

export const metadata: Metadata = { title: "Components" };

const demos: { file: string; eyebrow: string; title: string; Demo: ComponentType }[] = [
  { file: "masthead", eyebrow: "Masthead", title: "Who publishes, what it is, and the date, on one ruled line", Demo: Masthead },
  { file: "title", eyebrow: "Page title and lede", title: "The title says what the page decides; the lede says why", Demo: Title },
  { file: "section", eyebrow: "Ruled section with eyebrow", title: "A 1 px ink rule starts every section", Demo: SectionDemo },
  { file: "figures", eyebrow: "Figure row", title: "Big serif numbers, each with a label and a basis", Demo: Figures },
  { file: "table", eyebrow: "Data table", title: "Group headers, right-aligned tabular numbers, diff chips", Demo: Table },
  { file: "notes", eyebrow: "Notes, footnotes, honesty labels", title: "Say how sure we are: [F], [I], [H], [P], assumption", Demo: Notes },
  { file: "callout", eyebrow: "Callout", title: "Scope and assumptions as a ruled block, not a coloured box", Demo: Callout },
  { file: "flow", eyebrow: "Flow strip", title: "Who does what, in order; the reader's steps are shaded", Demo: Flow },
  { file: "phases", eyebrow: "Phase list", title: "A timeline with an optional status", Demo: Phases },
  { file: "lists", eyebrow: "Two-column lists", title: "Two short lists side by side", Demo: Lists },
  { file: "pills", eyebrow: "Status pills", title: "A word first; colour and marker shape repeat it", Demo: Pills },
  { file: "chart-diverging", eyebrow: "Chart: centred-zero bars", title: "Change by scenario, drawn to scale from the data", Demo: Diverging },
  { file: "chart-paired", eyebrow: "Chart: paired bars", title: "Before and after for each row", Demo: Paired },
  { file: "chart-line", eyebrow: "Chart: line and sparkline", title: "A line banked to 45°, and a sparkline in a sentence", Demo: Line },
  { file: "legal", eyebrow: "Legal / disclosure box", title: "Square, ink-framed, ruled: the only heavy frame", Demo: Legal },
  { file: "forms", eyebrow: "Form controls", title: "Input with unit, error, select, segmented control, buttons", Demo: Forms },
  { file: "nav", eyebrow: "Navigation", title: "Top navigation for a multi-page app", Demo: NavDemo },
];

const source = (file: string) => readFileSync(join(process.cwd(), "demos", `${file}.tsx`), "utf8");

export default function Components() {
  return (
    <>
      <PageTitle
        title="Components"
        lede="Each component as it renders, with its HTML (taken from the rendered page, so it always matches the package) and its React source."
      />
      {demos.map(({ file, eyebrow, title, Demo }) => (
        <Section key={file} id={`c-${file}`} eyebrow={eyebrow} title={title}>
          <HtmlSource react={source(file)}>
            <Demo />
          </HtmlSource>
        </Section>
      ))}
    </>
  );
}
