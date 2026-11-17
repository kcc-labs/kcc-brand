# KC&C brand kit and design system

**KC&C** (Credit & Collateral) publishes data, research, risk parameters and ratings for Canton Coin (CC) credit
markets; it does not lend. **mero** is the product family for lending on Canton: loan quotes, disclosures and the
mero rating.

This kit has everything needed to make a page, a document or an app look like KC&C or mero: logos, colours, type,
components, charts and document templates. The look is warm paper, ink rules, EB Garamond for words and big
numbers, and a plain sans for data. Every rule has a stated basis, and the build checks the rules it can measure.

## What is in the kit

| Path | What |
|---|---|
| `showcase/index.html` | Start here. One page with the logos, colours, type, components, charts and templates. Open it in a browser from the repo; it needs no network |
| `brand/USAGE.md` | How to use the logos: clear space, minimum sizes, colour versions, do and don't, co-branding |
| `brand/logos/` | 7 logos × 4 colour versions, SVG (`brand/README.md` explains the construction) |
| `brand/icons/`, `brand/og/` | Favicons and app icons (16–512 px, maskable, ICO), social card |
| `DESIGN.md` | The full guide: simplicity, the don'ts, principles, colour, type, layout, components, charts, documents, brand, copy |
| `html/starter.html` | A single-file page to copy: CSS inline, EB Garamond embedded |
| `html/kcc.css`, `html/kcc-charts.js` | The kit as one stylesheet and one chart script, for any HTML page |
| `html/templates/` | Seven document templates as single HTML files: proposal, research note, term sheet, monthly report, rating report, deck, letterhead |
| `packages/design` | `@kcc/design`: tokens, CSS components, React 19 components, chart geometry, Tailwind 4 preset |
| `apps/playground` | Next 16 docs site: every component with its HTML and React code, the templates, three example pages |
| `tokens/tokens.json` | The single source: colour (OKLCH), type, space, layout, rules, motion |
| `docs/evidence.md` | The basis of every rule: study, standard, mathematics, our measurement, or convention |
| `docs/math.md`, `docs/colour.md` | How every size and colour is computed, with the measurements |
| `docs/institutional.md` | Conventions of rating agencies, bank research and central banks, and the rules we take from them |
| `research/references.md` | Sources we studied, and what we adopt or reject |
| `research/apple-hig.md` | The owner's design reference: Apple HIG principles in our words, with URLs (principles only, not Apple's look) |
| `LICENSE`, `OFL.txt` files | Terms: code under MIT; KC&C and mero names and logos reserved; EB Garamond under the SIL OFL 1.1 |
| `AGENTS.md` | Instructions for coding agents |

All example figures in the kit are **sample data**. The pool, the client and the numbers in the examples
("Example Lending Pool", "Northwind Capital") are invented.

## Logos

Use the files in `brand/logos/` as they are, or the `Logo` component. Pick the colour version for the background:
`primary` on paper or white, `ink` for one-colour print, `reversed-green` on heavy green, `reversed-dark` on dark
paper. Keep 21 units of clear space (at the size in the file) and the minimum sizes. Never redraw, recolour or
stretch a logo. Never put a KC&C or mero logo in a client's palette or next to a client's logo without written
permission. Details: `brand/USAGE.md`.

The KC&C and mero names and logos are **not** open source. Use them only to refer to KC&C or mero, or with written
permission (`LICENSE`, section 2).

## Colours

Paper `#F3EFE4`, ink `#141414`, heavy green `--kc-green-800`, and red, green and neutral ramps in even OKLCH
steps, with a light and a dark theme. Use the `--kc-*` CSS variables, never raw values. Green and red never carry
meaning alone: a change also has a sign or a word. Every text pair passes WCAG 2.2 AA in both themes. See
`DESIGN.md` (colour) and `docs/colour.md`.

## Type

EB Garamond for words, titles and big figures; a static system sans (Helvetica Neue, Helvetica, Arial) for data, tables and controls; tabular figures for
numbers. Sizes come from a fixed scale (`--kc-text-*`); running text is at least 17 px. The kit embeds EB Garamond
(latin) in the CSS and preloads it, so text never moves when the page loads. See `DESIGN.md` (type) and
`docs/math.md`.

## Templates

Start every document from a template in `html/templates/` (single file) or `apps/playground/app/(sheet)/templates/`
(React). Keep the furniture: document number, version, date, classification mark, running header and footer, and
the closing "Important information". Replace only the content. Rules: `DESIGN.md` section 17 and
`docs/institutional.md`.

## Charts

Draw charts with the chart functions, not by hand. In a single HTML file, paste `html/kcc-charts.js` into a
`<script>`:

```html
<div id="c" class="kc-chart__scroll"></div>
<script>
  document.getElementById("c").innerHTML = kccCharts.toSvg(
    kccCharts.divergingBars({ label: "Change by scenario, percent", rows: [{ label: "Replay", value: 10 }, { label: "Crash", value: -15 }] })
  );
</script>
```

In React, use `DivergingBars`, `PairedBars`, `LineChart`, `Heatmap` and the other chart components of
`@kcc/design`. Compare values by position on one scale: no pies, no 3D. Each chart states its measure, unit and
period. See `DESIGN.md` (charts) and `docs/evidence.md`.

## Where the evidence is

Each rule in `DESIGN.md` has a row in `docs/evidence.md` with its basis (a study, a standard, mathematics, our
measurement in CI, or convention) and how the build checks it. `research/references.md` lists the sources and
what we adopt or reject. `research/evidence-run-2026-11-17.json` is the raw result of the evidence review.
`tokens/report.json` holds the measured contrast and colour-vision values.

## Use it in code

**Single file.** Copy `html/starter.html`. It has the CSS inline, with EB Garamond (latin) embedded and preloaded.
Keep the preload `<link>`. Take markup from the HTML tab of each component in the playground.

**Next app.**

```ts
// next.config.ts
export default { transpilePackages: ["@kcc/design"] };
```

```tsx
// app/layout.tsx
import "@kcc/design/fonts.css"; // EB Garamond, self-hosted
import "@kcc/design/kcc.css";   // tokens + components
import { FontPreload, Page, Section, Figures } from "@kcc/design";
// render <FontPreload /> inside <head>: the embedded EB Garamond is then ready before the first paint
```

**Tailwind 4.** `@import "tailwindcss"; @import "@kcc/design/tailwind.css";` (default colours, radii and shadows are
removed). For a JS config, use `@kcc/design/tailwind-preset`.

## Commands

```sh
npm install
npm run dev      # playground on http://localhost:3000
npm run tokens   # regenerate from tokens/tokens.json (also the showcase blocks and the OFL.txt copies)
npm run brand    # regenerate logos from brand/src/glyphs.json
npm run build    # build the playground and export html/templates/
npm run check    # tokens check (WCAG, colour vision, evidence floors), typecheck, lint, build, page gate (with the complexity budget)
```

Node 22.18 or later. The page gate needs Chromium once: `npx playwright install chromium`.

## Licence

- **Code** (scripts, packages, CSS, tokens, templates, docs): MIT. See `LICENSE`, section 1.
- **KC&C and mero names and logos** (`brand/logos`, `brand/icons`, `brand/og`, `brand/src`): not licensed, all
  rights reserved. See `LICENSE`, section 2.
- **EB Garamond** (embedded in the CSS, outlines in `brand/src/glyphs.json`): SIL Open Font License 1.1, Copyright
  2017 The EB Garamond Project Authors. Full text, next to each place the font ships: `html/OFL.txt`,
  `packages/design/OFL.txt`, `brand/src/OFL.txt`.
