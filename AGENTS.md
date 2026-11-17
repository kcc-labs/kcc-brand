# AGENTS.md

Instructions for coding agents working in this repository. Humans: see README.md.

## What this is

The KC&C design system: tokens, a plain HTML/CSS kit, a React 19 package (`@kcc/design`) and a Next 16 playground.
npm workspaces: `packages/design`, `apps/playground`. Rules for designers: `DESIGN.md`. Basis of every rule:
`docs/evidence.md`. Maths: `docs/math.md`. Colour proof: `docs/colour.md`.

## Simplicity and don'ts

The owner's reference is Apple's Human Interface Guidelines, principles only (`research/apple-hig.md`): remove the
unnecessary; every element earns its place. Do not copy Apple's look (no SF fonts, no Apple imagery or UI).

- **Remove before adding.** To fix or improve a page, first look for a block, rule, label, colour, note or number
  to take away. Never take away a figure's unit, basis, date or source, the confidentiality mark or a legal line.
- **Check the budget.** `node scripts/check-pages.ts --budget` prints, per page, the font sizes, non-neutral
  colours, box depth, border-plus-background count and longest heading. Limits: `tokens.json` → `budget`
  (DESIGN.md, Simplicity). Stay under them; a warning means you are at the edge.
- **Follow the Don'ts** in `DESIGN.md` (one numbered list). When you remove or refuse something, cite the don't
  in your report or commit message ("Don'ts 5: table moved to the appendix").
- `data-kc-specimen` is only for blocks that show the scale or the palette on purpose. Do not use it to get a
  page under the budget.

## Commands

- `npm install`: install (Node 22.18 or later; Node runs the `.ts` scripts directly).
- `npm run tokens`: rebuild every generated file from `tokens/tokens.json`. Run it after any token or
  `components.css` change.
- `npm run brand`: rebuild the logo SVGs and `packages/design/src/brand-data.ts`. `node scripts/render-icons.ts`
  re-renders the PNG/ICO icons and the social card (needs Chrome).
- `npm run dev`: playground at http://localhost:3000.
- `npm run check`: the gate. It runs, in order: the tokens check (stale files, WCAG 2.2 contrast, colour-vision
  pairs, evidence floors, font metrics, the Tailwind preset), typecheck, lint, the production build, then the page
  gate (`npm run check:pages`, Playwright Chromium; it includes the complexity budget). It must pass before you finish. First run on a machine:
  `npx playwright install chromium`.
- `node scripts/check-pages.ts --verbose`: the page gate with every warning listed.

## Source of truth

- Edit `tokens/tokens.json` (parameters) and `scripts/lib/tokens.ts` (formulas). Never edit generated files:
  `packages/design/css/tokens.css`, `packages/design/css/fonts.css`, `packages/design/css/font-embed.css`,
  `packages/design/src/font-data.ts`, `packages/design/src/tokens.ts`, `packages/design/tailwind/*`,
  `tokens/report.json`, `tokens/metrics.json`, `html/*` (including `html/templates/`, exported by `npm run build`),
  `brand/logos/*`, `brand/icons/*`, `packages/design/src/brand-data.ts`, the `OFL.txt` copies (from the font
  package), and the blocks between `<!-- gen:… -->` markers in `DESIGN.md`, `docs/colour.md`, `docs/math.md` and
  `showcase/index.html` (kit CSS with the embedded font, colour ramps, charts).
- Component styles: `packages/design/css/components.css`. Component markup: `packages/design/src/*.tsx`. The
  chart geometry, `packages/design/src/charts/core.ts`, is also compiled to `html/kcc-charts.js`. Keep it free of
  imports and of non-erasable TypeScript (no enums, namespaces or parameter properties).

## Rules

- Never hard-code a colour, size, space, radius or duration. Use `var(--kc-…)` in CSS and `tokens` in TypeScript.
  If no token fits, add a parameter to `tokens.json`. Do not add a one-off value.
- Radius is 0, or `--kc-radius-small` on inputs, selects and pills. Everything else not to do: DESIGN.md, Don'ts.
- Serif for words and big figures, sans for data and interface (DESIGN.md, section 2).
- Every figure in an example has a unit, basis and date. Invented data is labelled "Sample data".
- Components have no hooks and no `"use client"`, so they work in Server Components. Put interactivity in the app.
- CSS classes use the `kc-` prefix with BEM parts (`kc-legal__cell`) and modifiers (`kc-pill--watch`). Put new
  rules in `@layer components`.
- TypeScript is strict. Do not use `any`. Prefer small, typed props over configuration objects.
- Use the latest stable package versions, pinned exactly (no `^`). Commit `package-lock.json`.
- Write docs in plain English: short sentences, active voice, one meaning a word.

## Brand and documents

- Always use the logo files (`brand/logos/*.svg`) or `<Logo>`. Never redraw, retype, trace or recolour a logo, and
  never draw a new mark. Logo changes go through `scripts/build-brand.ts`, then `npm run brand` and
  `node scripts/render-icons.ts`.
- Licences (`LICENSE`): code is MIT; the KC&C and mero names and logos are reserved; EB Garamond is under the
  SIL OFL 1.1 (`OFL.txt` next to each place the font ships). Do not change these terms; keep `brand/USAGE.md`
  in step with the logo rules.
- Any page or document meant for a named counterparty carries the confidentiality mark: `ClassMark` with
  `level="confidential"` and the recipient's name, at the top and in the footer of every page (`Sheets` and
  `Slide` add the footer).
- Every document has a number (`KCC-<type>-<year>-<sequence>`), a version and a date (`DocMeta`), and ends with
  `Disclaimer`.
- Start new documents from a template in `apps/playground/app/(sheet)/templates/` (or `html/templates/` for single
  files). Keep the furniture; replace only the content.
- Never imitate a real firm's logo, name or look (this includes Apple's).
- **Everything about design lives in this repo**: tokens, components, templates, brand files, research, evidence,
  showcase (`showcase/`), and the tooling to print and review documents (`scripts/print-pdf.sh`,
  `scripts/render-pdf-pages.swift`). Never leave design work in a temporary folder.
- **This repository is shared outside KC&C.** Documents for a named counterparty are built from the templates and
  stored outside this repo, in the owner's document store, with their source and PDF. Never put in this repo the
  name of a real client, prospect or partner, their data, their simulation results, a "Confidential — for <name>"
  mark with a real name, a party id, a real email address, an internal host or path, or a secret. Examples use
  fictional names ("Example Lending Pool", "Northwind Capital") and round numbers labelled "Sample data".
- Print with `scripts/print-pdf.sh page.html out.pdf [scale]`. To fit more on a page, pass a scale (for example 0.8); never shrink with CSS `zoom` or `transform`: they give fractional widths and the page margin clips borders on the right edge. `print-pdf.ts` also keeps content 2px inside the printable area, because a 1px border that ends exactly on its edge is half cut.
- Review every printed document page by page: `scripts/print-pdf.sh page.html out.pdf` writes the PDF and one PNG per
  page; look at each page for orphaned headings, half-empty pages and clipped charts before sending.

## Evidence rule

- Do not add a design rule without a basis in `docs/evidence.md`: a study, a standard (as a requirement of that
  standard), a guideline from the Apple HIG (quoted, with the page URL), mathematics, our CI measurement, or
  "convention" (allowed, but labelled). Popularity is not a basis. A study outranks the HIG.
- Do not cite a claim listed as refuted or unverified in `docs/evidence.md` (section 3) as evidence.
- A new measurable rule gets a check in `scripts/build-tokens.ts` or `scripts/check-pages.ts`, and a violation in
  `scripts/fixtures/gate-violations.html`. The gate's self-test fails if a rule stops firing.

## What fails the build, and how to fix it

| Failure | Fix |
|---|---|
| `layout-shift` (any shift > 0, fonts delayed or blocked, images delayed) | Give every `img` `width` and `height`; draw charts with the chart functions (SVG with a `viewBox`); never insert content above content already shown; reserve the final height of any slot filled later. Keep `<FontPreload />` in the root `<head>` (React) or the preload `<link>` (single file). Do not set `font-display: swap`. |
| `font.embedded` | The embedded EB Garamond is not in use: restore `<FontPreload />` or the preload link, and `@kcc/design/fonts.css`. |
| `type.size` (running text < 17 px) | Running text (2+ lines) uses `--kc-text-base` or larger. Notes, captions and footers may stay smaller (warnings), but text a reader must act on may not. |
| `type.line-height` (< 1.2) | Use `--kc-leading-data` or `--kc-leading-body` for running text. |
| `type.measure` (≤ 25 characters a line) | On phones, stack columns so running text takes the full width. |
| `target.2.5.8` | Pointer targets at least 24 × 24 CSS px, or spaced so a 24 px circle on each meets no other target. Use the 44 px `--kc-control-height`. |
| `chart.value-axis`, `chart.grid-gap` | Use the chart functions; do not pass a height that makes the value axis < 80 px; do not force tick counts. Do not shrink charts below 520 px outside a scroll wrapper. |
| `colour.redundancy` | A change chip has a sign (+, U+2212) or a word; a value that rounds to zero is `neutral`; pills have a word; up/down marks have a signed `<title>`; heatmap cells print values. |
| `layout.reflow`, `layout.media-size` | No horizontal page scroll at 320 px; wrap wide tables and charts in their scroll wrapper. Images get `width`/`height`. |
| Colour-vision pair < 2 (tokens) | Move the lightness of one colour apart (OKLCH L), then `npm run tokens`. Never rely on the colour alone. |
| `budget.fontSizes` | Use the type scale only (no `em` or px sizes); one size per role. Two body sizes on one page (17 and 19) is the usual cause. |
| `budget.accentColours` | Remove a series or a chart; a page rarely needs a heatmap and a stacked area. State colours only for state. |
| `budget.boxDepth`, `budget.borderAndBackground` | Replace the box or card with a rule and space (DESIGN.md, section 5). |
| `budget.headingWords` | Say the finding in fewer words; move the method to the eyebrow or a note. |
| Evidence floor (tokens) | Do not lower a floor in `tokens.json` → `evidence`; change the token instead. |

## Chart rules (evidence)

- Compare values by position on one aligned scale. No pies, no bubbles, no stacked bars for comparisons; compared
  bars sit next to each other.
- Banking to 45° is a heuristic. Use `height: "bank"` or `"arc"` only when slopes matter; otherwise keep the
  default; prefer wider, flatter charts.

## Accessibility gates

- WCAG 2.2 AA in both themes. The build fails if a contrast pair drops under 4.5:1 (text) or 3:1 (graphics). Add a
  pair to `tokens.json` → `contrast.pairs` for any new colour combination.
- Colour never carries meaning alone (SC 1.4.1): add a sign, a word or a shape. The page gate checks it.
- Interactive elements keep the 2 px ink focus ring. Targets are at least 24 × 24 CSS px (SC 2.5.8, gated);
  controls are 44 px high (convention).
- Charts: `role="img"` with a name that states the measure, unit and period. Bars carry a `<title>`.

## Add a component

1. Write the CSS in `packages/design/css/components.css` with tokens only.
2. Write the React wrapper in `packages/design/src/<area>.tsx` and export it from `src/index.ts`.
3. Add a demo in `apps/playground/demos/<name>.tsx` and list it in `apps/playground/app/components/page.tsx`. The
   page shows its HTML and React code automatically.
4. Add the rule for when to use it to `DESIGN.md`.
5. Run `npm run tokens` (this refreshes `html/kcc.css`), then `npm run check`.

## Do not

- Do not edit other repositories from here (the KC&C site, or the apps that use this kit).
- Do not add print styles. Pages are web first; documents that leave as PDFs use `Sheets`.
- Do not add a CSS framework, CSS-in-JS or an icon font.
- Do not commit or push unless asked.

## Before you finish (PR checklist)

- [ ] `npm run check` passes, including the page gate (no layout shift, floors, targets, charts, redundancy, budget).
- [ ] You removed something before you added something, and named the don't you followed.
- [ ] Every new or changed rule has a row in `docs/evidence.md` with its basis.
- [ ] No hard-coded colours or sizes. `grep -nE '#[0-9a-fA-F]{3,6}\b' packages/design/css/components.css` finds
      nothing. Raw px are allowed only for 1–4 px optical offsets, pill marker sizes, the A4/Letter sheet sizes and media-query breakpoints
      (CSS variables do not work in media queries).
- [ ] Both themes look right on the playground (theme switch, Colour page).
- [ ] New colour pairs are in `contrast.pairs` and pass.
- [ ] DESIGN.md is updated if a rule changed.
