import { Callout, ListBlock, Note, PageTitle, Section, TwoColumns } from "@kcc/design";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <PageTitle
        title="The KC&C design system"
        lede="One look for our documents, reports, proposals and data apps: warm paper, ink rules, EB Garamond for words and big numbers, a plain sans for data. Every figure carries its unit, basis and date."
      />
      <Section id="what" eyebrow="What is here" title="Tokens, a CSS kit, React components and the rules">
        <TwoColumns>
          <ListBlock
            title="See"
            items={[
              <Link key="t" href="/tokens">Tokens: type, space, grid, rules, motion</Link>,
              <Link key="c" href="/colour">Colour: ramps, chart palettes, contrast, sample charts in both themes</Link>,
              <Link key="k" href="/components">Components, each with its HTML and React code</Link>,
              <Link key="b" href="/brand">Brand: logos, construction, icons, social card, do and don&apos;t</Link>,
              <Link key="tp" href="/templates">Templates: research note, term sheet, rating report, monthly report, deck, letterhead</Link>,
            ]}
          />
          <ListBlock
            title="Examples"
            items={[
              <Link key="p" href="/examples/proposal">A pilot proposal (fictional pool, sample data)</Link>,
              <Link key="d" href="/examples/dashboard">A dense data dashboard</Link>,
              <Link key="m" href="/examples/mero-quote">A mero loan quote with the New York disclosure</Link>,
            ]}
          />
        </TwoColumns>
      </Section>

      <Section id="use" eyebrow="How to use it" title="Two ways in: one file, or the package">
        <Callout label="Single file">
          <p>
            Start from <code>html/starter.html</code>. It has <code>html/kcc.css</code> (EB Garamond embedded, tokens and
            components) inline in a <code>&lt;style&gt;</code>. Copy markup from the HTML tab of any component. For charts drawn in the browser,
            paste <code>html/kcc-charts.js</code> into a <code>&lt;script&gt;</code> and call <code>kccCharts.toSvg(kccCharts.lineChart(…))</code>.
          </p>
        </Callout>
        <Callout label="Next app">
          <p>
            Add <code>@kcc/design</code>, set <code>transpilePackages: [&quot;@kcc/design&quot;]</code>, and import{" "}
            <code>@kcc/design/fonts.css</code> and <code>@kcc/design/kcc.css</code> once in the root layout. Fonts are self-hosted from
            @fontsource. With Tailwind 4, add <code>@import &quot;@kcc/design/tailwind.css&quot;</code> after Tailwind.
          </p>
        </Callout>
        <Note>The rules are in DESIGN.md, the maths in docs/math.md, the colour proof in docs/colour.md, institutional conventions in docs/institutional.md, sources in research/references.md.</Note>
      </Section>
    </>
  );
}
