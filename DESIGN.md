# KC&C design rules

These rules apply to every KC&C page: documents, reports, proposals, data apps and the mero products. The look
comes from our first pilot proposals and the KC&C site: warm paper, ink rules, EB Garamond for words and big
numbers, a plain sans for data.

The tokens are in `tokens/tokens.json`. The maths is in `docs/math.md`, the colour proof in `docs/colour.md`, and
the sources in `research/references.md`. Brand files are in `brand/`, and how to use the logos in `brand/USAGE.md`; institutional conventions are in
`docs/institutional.md`. If a rule here and the code do not agree, fix the one that is wrong.

**Every rule has a basis.** `docs/evidence.md` lists each rule with its basis: a measured study, a published
standard (a requirement of that standard), a published guideline the owner chose as the reference (**Apple HIG**,
quoted with its URL), mathematics, our own measurement in CI, or **convention** (a choice of taste or habit,
allowed, but labelled). Popularity is not a basis. Rules marked *(convention)* below can change when the owner's
taste changes; rules marked *(Apple HIG)* change when the guideline or the owner's reference changes; the others
change only with new evidence. When the HIG and a study disagree, the study wins. Do not add a rule without a row
in `docs/evidence.md`.

## Simplicity *(Apple HIG, the owner's reference)*

Apple's design principles: "A well-designed experience removes the unnecessary, with every element earning its
place" (https://developer.apple.com/design/human-interface-guidelines/design-principles). We take the principle,
not Apple's look. Notes and the other HIG pages we use: `research/apple-hig.md`.

- **Content first.** The finding and the number come first. Controls, notes and method sit below them.
- **One idea per section.** A section has one heading, and the heading is its finding. A second idea gets a
  second section.
- **Fewer elements.** Fewer sizes, colours, rules and labels. The page gate counts them (budget below).
- **Generous whitespace, on the scale.** Separate things with space from the spacing scale (s4 21 between blocks,
  s6 55 between sections) before you reach for a rule, and with a rule before a box.
- **Remove before adding.** To fix a page, first look for something to take away.
- **Every element earns its place.** Name the job of each block, rule, label, colour and note. No job: remove it.
  Simplicity is not minimalism: the unit, basis, date and source of a figure, the confidentiality mark and the
  disclosures required by law always have a job.

**Complexity budget** *(convention; the numbers are ours, gated by the page gate, `tokens.json` → `budget`)*. Per
page, as rendered at 1280 and 320 px:

| Count | Fails above | Warns at | Why this number |
|---|---|---|---|
| Distinct font sizes | 7 | 7 | Seven type roles: secondary 13, data 15, body 17 or 19, lede 21, section 27, figure 34 or 43, title 55 |
| Distinct non-neutral colours | 6 | 6 | Up, down and watch, plus at most three series colours; a heatmap ramp counts once |
| Bordered boxes inside bordered boxes | 1 | — | No box inside a box (controls, pills, sheets and slides are not boxes) |
| Elements with a border and a background | 0 | — | That is a card; controls are exempt |
| Words in the longest heading | 12 | 11 | A finding fits in a short sentence |

A block that shows the scale or the palette on purpose (a specimen on the Tokens or Colour page) carries
`data-kc-specimen` and is not counted. Do not use it to hide a real page from the budget.

## Don'ts

One list. Each item says its basis; `docs/evidence.md` has the source. *(HIG: Apple Human Interface Guidelines,
the owner's reference.)*

1. **No decoration without a job.** No ornament, texture, illustration or divider that carries no information.
   *(Apple HIG: Design principles)*
2. **No more than one accent colour a view.** Heavy green marks one thing; up, down and watch mean only better,
   worse and watch. *(Apple HIG: Color; the "one" is convention)*
3. **No colour as the only signal.** Every coloured state also has a sign, a word or a shape. *(Standard: WCAG
   2.2 SC 1.4.1; gated)*
4. **No boxes inside boxes, and no cards.** No panel with a border and a background, no shadow, no rounded block,
   no gradient. The legal box is the only framed block. *(convention; gated)*
5. **No duplicate information.** Do not show the same numbers as a chart and a table on one page; put the table
   in an appendix. Do not repeat a figure in the figure row, the text and a table. *(Apple HIG: Charting data)*
6. **No more than seven font sizes a page, and none off the scale.** *(convention; the count is gated)*
7. **No legend when a direct label fits.** Name series at the line end and values at the bar end. Legends are
   for heatmap scales and paired bars only. *(convention)*
8. **No icon without a visible text label.** *(convention, stricter than the HIG; the accessible name is WCAG 2.2
   SC 4.1.2)*
9. **No animation that is not feedback** to the reader's own action. Nothing moves on its own. *(Apple HIG:
   Motion)*
10. **No uppercase sentences and no italics for emphasis.** Uppercase only for short labels. *(convention)*
11. **No marketing words** ("powerful", "seamless", "cutting-edge") and no promises ("safe", "guaranteed",
    "insured", "risk-free", "deposit", a promised return). *(Apple HIG: Writing; the word list is convention)*
12. **No subjective words about data** ("rapidly", "almost", "soared"): give the value. *(Apple HIG: Charts)*
13. **No crypto clichés:** neon, glows, coins, emoji, rocket language. *(convention, `docs/institutional.md`)*
14. **No headings that name a topic** ("Results") and none over 12 words. *(convention; length gated)*
15. **No pies, bubbles or stacked bars to compare values.** *(Study: Cleveland and McGill 1984; Talbot et al.
    2014)*
16. **No area fill under a line whose axis does not start at zero.** A filled area reads as size from the
    baseline. *(Math)*
17. **No more than one primary button a view.** *(convention, inside the HIG's "one or two")*
18. **No critical value only on hover** or behind a click. Print it. *(Apple HIG: Charts)*
19. **No light font weights.** Serif 400 and 500, sans 400 and 600 only. *(Apple HIG: Typography)*
20. **No "click here", no "Oops", no blame** in errors: say what is wrong and how to fix it. *(Apple HIG: Writing)*
21. **No "we" in app interface text.** Name the actor ("the lender sells"). Documents may say "we": the masthead
    names us. *(Apple HIG: Writing)*
22. **No redrawn, recoloured or stretched logo.** *(convention; `brand/USAGE.md` has the full logo list)*

## 1. Principles

1. **The number is the product.** The reader comes for a figure. Make it the largest thing in its block, in the
   serif, with nothing competing next to it.
2. **Every figure has its unit, basis and date.** "+10% borrower capacity, mean over 500 held-out paths,
   simulated". "$0.1532, KC&C reference, 17 Nov 2026, 17:00 UTC". A number without a source is not shown. A
   missing value is "—" with the reason near it, never an invented number.
3. **Say how sure we are.** Label claims: **[F]** fact with a source, **[I]** our interpretation, **[H]**
   hypothesis, **[P]** planned. Mark inputs we chose with the tag "assumption". Mark sample data with the
   "Sample data" pill. Simulations say "simulated" and "not a forecast".
4. **One bold thing a page.** Each page has one main figure or one main statement. Everything else is ink on
   paper at a lower level. Colour is for state and change, not for decoration.
5. **Rules, not boxes.** A 1 px ink rule starts each section. Hairlines separate rows. There are no cards, no
   shadows and no rounded panels. The only framed box is the legal box.
6. **The heading is the finding.** Write "More room to borrow, the same number of liquidations". Do not write
   "Results". The eyebrow above the heading says what was measured and on what basis.

## 2. Serif or sans *(convention)*

No verified study shows serif or sans to be more legible on screen or in print. The split is a brand choice.

| Use EB Garamond (serif) for | Use the system sans for |
|---|---|
| Page title, section headings | Tables, all of their cells and headers |
| The lede and reading text | Chart text: labels, values, ticks |
| Big figures (figure row, statement) | Eyebrows, masthead, nav, buttons, pills |
| | Notes, footnotes, captions, the legal box |
| | Form labels, hints, inputs |

The rule: **words to read in the serif, data to scan in the sans.** A number in a sentence stays in the serif. A
number in a table, chart or form is in the sans. All figures are lining and tabular, so columns line up (this is
mathematics, not taste: tabular figures share one advance width, so digits of the same place sit under each other).

In apps (`body class="kc-app"`), interface text is sans at 17 px. Titles, the statement line and big figures stay
in the serif.

Uppercase is only for short labels: eyebrows, the masthead, table headers, nav, buttons, h3 labels. Uppercase
text has 0.04–0.06 em tracking (Don'ts, 10). *(convention)*

## 3. Type scale

Use only these sizes (variables `--kc-text-*`). The steps are a convention: the display sizes follow the golden
ratio (13 × √φᵏ) because the owner likes the KC&C site's proportions. No study shows that golden-ratio or other
modular scales read better; we keep it as taste and label it so.

**Floors (evidence, gated by `npm run check`):**

- **Running text is at least 17 px.** Running text is any paragraph or list item of two lines or more. Rello,
  Pielot and Marcos (CHI 2016) measured worse comprehension at 10 and 12 pt than at 18 pt (their 12 pt is about
  16 px on their screen). This is a floor, not an optimum: their reading measures kept improving up to about
  18–22 pt (about 24–29 px on their screen), and our 19 px reading size is between their tested sizes. The pt-to-px
  mapping is the authors' and their screen's, not a visual-angle conversion.
- **Line height of running text is at least 1.2.** The same study: 0.8 × the browser default (about 1.2) hurt
  comprehension; 1.0 to 1.8 × made no measurable difference. Our 1.55 for reading text and 1.4 for data are
  *(convention)* inside the safe range.
- Secondary text (notes, footnotes, captions, eyebrows, the legal box) at 13 and 15 px is *(convention)*, below
  the running-text floor. Keep it short; the page gate lists it as warnings. Text a reader must read to act
  (callouts, terms of a term sheet) is running text and uses `base` (17 px) or larger.

| Token | px | Use |
|---|---|---|
| xs | 13 | Eyebrows, table headers, chart text, footnotes, pills |
| sm | 15 | Tables, notes, labels, controls, nav |
| base | 17 | App body, inputs |
| read | 19 | Serif reading text in documents |
| lg | 21 | Lede |
| xl | 27 | Section heading (h2) |
| 2xl | 34 | Title in apps and on phones; compact figures |
| 3xl | 43 | Figure row |
| 4xl | 55 | Document title |
| 5xl | 89 | One hero number, at most once a page |

Weights: serif 400 for text, 500 for headings and figures. Sans 400 for text, 600 for headers, labels, diff
chips and buttons. Do not use other weights.

Fonts are static, never variable: EB Garamond ships one static face a weight (400, 500), and the sans is
`"Helvetica Neue", Helvetica, Arial, sans-serif`, not `system-ui` (SF Pro on macOS is variable). Chromium prints
variable fonts and synthesised weights as Type 3 glyphs, and copied PDF text then splits words. *(our CI measurement,
docs/evidence.md; `npm run check:pdf`)*

## 4. Spacing and layout

- Space steps (Fibonacci): s1 5, s2 8, s3 13, s4 21, s5 34, s6 55, s7 89, s8 144. Do not use other values.
  *(convention: the values are exact mathematics, the choice of Fibonacci is taste)*
- Section: 55 px (s6) above the rule, 13 px (s3) from the rule to the eyebrow, 21 px (s4) between blocks.
- Page: 987 px of content. The gutter is 21 px on phones and 34 px from 640 px. *(convention)*
- Grid: 12 columns of 63 px with 21 px gutters (`.kc-grid`, `.kc-col-N`). Start text, tables and charts on column
  edges. *(convention; the build checks the column is a whole pixel)*
- **Measure.** Serif reading text is at most 483 px wide (`--kc-measure`, about 67 characters at 19 px, measured
  from the font). This width is a **preference default**, not a speed rule: on screen, Dyson and Kipping (1998)
  found 100-character lines read faster than 25-character lines, and readers' preference for about 55 characters
  did not match their speed. Sans notes are at most 567 px (`--kc-measure-wide`). *(convention)*
- **Measure floor (evidence, gated):** running text never has 25 characters a line or fewer, at any width from
  320 px. On phones, let text take the full column; do not put running text in narrow side-by-side cells.
- Golden split (`.kc-split`): an aside of 377 px beside a main column of 610 px. Use it for a form beside its
  result or for notes beside text. It stacks under 880 px. *(convention)*
- No horizontal page scroll at any width from 320 px (WCAG 2.2 SC 1.4.10 Reflow, a requirement at level AA). Wide
  tables and charts scroll inside their own wrapper, and the wrapper can take keyboard focus (SC 2.1.1).
- **Nothing moves after first paint (our CI measurement, gated).** The page gate loads every page with fonts
  delayed and blocked and images delayed, and fails on any layout shift above 0. So: EB Garamond latin is embedded
  and preloaded (`<FontPreload />`, or the `<link rel="preload">` in the single-file kit); the fallback serif is
  sized to EB Garamond from both fonts' metrics; every `img` has `width` and `height`; every chart SVG has a
  `viewBox`; never insert content above content that is already on screen.

## 5. Rules, not cards *(convention)*

- A 1 px ink rule above each section, table, flow strip and figure row. Hairlines between rows and figure cells.
- One square, 2 px frame: the legal box. A callout is a ruled block with a label, not a coloured box.
- `--kc-paper-2` marks only a selected table row. A step the reader owns says so in its title ("Your pool"); it
  has no tint.
- Radius small only on inputs, selects and pills. What not to do is in the Don'ts list (4).

## 6. Colour

- Paper and ink do most of the work. Muted ink is for secondary text.
- **Up** (heavy green) means better for the reader. **Down** (heavy red) means worse. They are not the sign of the
  number: a fall in losses is "up". **Watch** (ochre) means look at this, not yet wrong.
- A colour never carries meaning alone (WCAG 2.2 SC 1.4.1, a requirement). Every change has a sign or a word.
  Every status pill has a word and a marker shape (docs/colour.md, section 6). A change that rounds to zero ("0%")
  has no side, so it takes the neutral tone, not up or down. The page gate checks chips, pills, up/down marks and
  heatmap cells.
- Colour-vision check (gated): every pair that carries meaning keeps an OKLab distance of at least 2 (× 100)
  under protanopia and deuteranopia simulation (Machado 2009, severity 1). The threshold is a *(convention)*; no
  study gives one. The redundancy rule above is what protects colour-blind readers.
- Never type a colour. Use `var(--kc-…)` in CSS, or `tokens` in TypeScript.
- Dark theme: the tokens switch with `prefers-color-scheme`, or with `data-theme="light|dark"` on `<html>`. Any
  element with `data-theme` starts a themed island.

## 7. Figures

- A figure row (`.kc-figs`) holds 2 to 4 figures. Each has a value (serif 43 px), a label (what it is, lowercase)
  and a basis (unit, period, source or "simulated").
- Show a change next to the value as a diff chip: "8.8% +0.8 pt".
- Money: "$1.1M", "$110k" in headlines and tables. Exact amounts ("$51,380.82") in quotes and legal text. Rates:
  "11.32%"; changes: "+10%", "−15%" with a true minus sign (U+2212), "+0.8 pt" for a change in a rate.
- Dates: "17 Nov 2026" in documents. Times with "UTC". The mero app keeps US dates ("Nov 17, 2026") for US
  borrowers.
- Apps do no arithmetic on money in the browser. They format decimal strings from the API.

## 8. Tables

- The first column is the row header (`<th scope="row">`), left-aligned. Every other column is a number:
  right-aligned, tabular, no wrap.
- Group headers (`tr.kc-group`) name a pair of columns ("Borrower capacity: Today, Software"). Each group has an
  ink rule under it.
- Column headers are short, uppercase, 13 px, muted. Put the unit in the header or the eyebrow, not in every cell
  when the unit is the same for the whole column.
- A total row has an ink rule above it.
- Diff chips (`.kc-diff--up/down/neutral`) sit after the value in the same cell.
- Under 15 rows: use a table, not a chart *(convention)*. Dense tables (`.kc-table--dense`) use 13 px and 5/8 px padding.

## 9. Charts

- **Compare by position on a common scale (evidence).** Position is judged more accurately than length, and length
  more than angle or area (Cleveland and McGill 1984; replicated by Heer and Bostock 2010 and Talbot et al. 2014).
  So: values to compare sit on one aligned axis (dots, aligned bars, lines). Do not use pie charts or bubbles to
  compare values.
- **Aligned bars, not stacked bars, for comparisons (evidence).** Talbot, Setlur and Anand (2014) measured more
  error for stacked segments and for bars far apart. Put bars that are compared next to each other on one
  baseline (paired bars). Sorting by value is the authors' suggestion, not a tested fix *(convention)*. There is no stacked bar chart in the
  system; the stacked area is only for part of a whole over time, where the total is the message. To compare
  layers, draw them as lines on one scale.
- Choose the form by the relation (FT Visual Vocabulary) *(convention)*: change over time is a line or columns;
  deviation is centred-zero bars; before and after is paired bars; part of a whole is a stacked area; a grid of
  changes is a heatmap; a trend in a sentence or a cell is a sparkline.
- Draw from data with `@kcc/design/charts` (or `html/kcc-charts.js`). Do not draw charts by hand. Bars start at
  zero (mathematics: a bar's length is proportional to its value only from zero). Centred-zero bars are
  symmetric. Ticks are round numbers *(convention)*.
- **Size floors (evidence, gated):** a chart read for values has a value axis of at least 80 CSS px, and gridlines
  are at least 8 CSS px apart (Heer and Bostock 2010: 40 px charts gave more error, no gain above 80 px;
  gridlines improved accuracy; 8 px is the authors' suggestion). The chart functions raise the height and drop
  ticks to meet both at the narrowest drawn width (520 px). Sparklines are not for reading values: print the value
  next to them.
- Label the data directly: values at bar ends, series names at line and layer ends. Use a legend only for heatmap
  scales and paired bars. *(convention: direct labels have no verified study in our research)*
- Gridlines are hairlines. Zero and the axis are ink. Limits (margin call) are a dashed ochre line, labelled.
- Categorical colours in order: ink, green, red, blue, ochre, plum, mauve, olive. Use no more than 4 without direct
  labels *(convention)*. In comparisons, the baseline is neutral grey and the subject is ink.
- **Aspect ratio.** Banking to 45° is a heuristic, not a law: it is optimal only for two line segments (Heer and
  Agrawala 2006), and Talbot, Gerth and Hanrahan (2012) measured that slope-comparison errors are generally not
  lowest at 45° and that flatter charts often do better. So: do not force 45°. `height: "bank"` (median absolute
  slope) and `height: "arc"` (arc-length banking, Talbot et al. 2011, mathematically defined, not perceptually
  validated) are options for line charts where slopes matter. When unsure, prefer a wider, flatter chart. The
  default ratio 1/φ² (0.382) and the clamp [1/φ³, 1/φ] are *(convention)*.
- Every chart is a `<figure>` with an accessible name that states the measure, unit and period. Each bar has a
  `<title>` with its value. A caption gives the source and basis, not a note on the design. When a reader must check
  the numbers of a chart, put the table in an appendix, not next to the chart *(Apple HIG: Charting data)*.

## 10. Copy voice *(convention)*

- Plain, short sentences. Active voice. Present tense. Write for a reader whose first language is not English.
- Use the reader's words: "Amount you want to borrow", not "Principal requested". Use "you". In documents "we" is
  KC&C, named in the masthead; in app interface text, name the actor *(Apple HIG: Writing)*.
- Lead with the result, then the method. Put the method and the limits in a note or the footer, not in the
  heading.
- Name the uncertainty. "Within noise", "our assumption", "not a forecast".
- Forbidden words and claims: Don'ts, 11 and 12.
- Buttons say the action: "Get quote", "Accept this offer". An error says what is wrong and how to fix it:
  "Enter at least 400,000 CC for this amount."

## 11. Apps and forms

- Label above the field, hint under the label, error under the field. Connect them with `aria-describedby`.
- Amounts are text inputs with `inputmode="decimal"`, right-aligned, with the unit as a prefix or suffix.
- Controls are 44 px high *(convention, the size of WCAG SC 2.5.5, a level AAA criterion)*. The requirement we
  gate is WCAG 2.2 SC 2.5.8 (AA): every pointer target is at least 24 × 24 CSS px, or meets its spacing or inline
  exception. There is one primary button a view (ink fill). Secondary buttons are outlined. Quiet buttons are
  underlined text. *(convention)*
- Use a segmented control for 2 to 4 choices. It is made of native radio buttons and works without JavaScript.
- Navigation: a top bar with the brand and up to 6 sections. The current section is underlined. On small screens
  the items wrap. There is no hidden menu.
- The mero quote starts with the statement: "You borrow X. You pay back Y in total by D." The figures, the risk
  callout and the legal box follow.
- The legal box (`.kc-legal`) is for disclosures required by law, such as the New York commercial financing
  disclosure. Do not use it for anything else.

## 12. Accessibility (the gate)

- WCAG 2.2 AA. Text contrast is at least 4.5:1, and graphics and control borders at least 3:1, in both themes.
  `npm run tokens` measures every pair and fails under the minimum (section 15).
- One `h1` a page. Do not skip heading levels. Each section is labelled by its heading. Use landmarks (`nav`,
  `main`, `footer`) and a skip link.
- Focus ring: 2 px ink with a 2 px offset on every interactive element. Do not remove it (SC 2.4.7 requires a
  visible focus; 2 px and 3:1 match SC 2.4.13, level AAA).
- Pointer targets are at least 24 × 24 CSS px (SC 2.5.8, gated). Nav links, buttons, inputs and segments are 44 px
  high *(convention)*.
- Never use colour alone to give information (section 6).
- Scrollable tables are regions with a name and `tabindex="0"`.
- `prefers-reduced-motion` turns off every transition. Motion is only feedback to the reader's action, such as
  hover (200–350 ms, one easing curve; the durations and the curve are *(convention)*; feedback only is *(Apple HIG:
  Motion)*).
- Live results (quotes) are in `aria-live="polite"`.

## 13. Web first; sheets for documents that leave

Pages are made for screens. Artifacts cannot print, so do not add print styles, page breaks or "print this page"
links. To share a page, give its link.

Some documents leave the screen: term sheets, rating reports, research notes and letters go out as PDFs and are
read page by page. Build these as **sheets** (`Sheets`, A4 or US Letter). Each sheet carries the page furniture
(section 17), and a PDF tool can export it page for page. This is the only place a page sits on a tone: the tone
stands for the desk under the paper.

## 14. How to use the system

- **Single file** (artifact, one-off report): start from `html/starter.html`. It has the CSS inline with EB Garamond
  (latin) embedded and preloaded, so it needs no font request. Keep the preload `<link>` in the head. Copy markup
  from the HTML tab in the playground. For charts drawn in the page, paste `html/kcc-charts.js` into a `<script>`,
  and give the chart's container its final height before the script runs (or draw it into an element below
  everything else), so nothing moves.
- **Next app**: add `@kcc/design` and set `transpilePackages: ["@kcc/design"]`. Import
  `@kcc/design/fonts.css` (self-hosted EB Garamond) and `@kcc/design/kcc.css` in the root layout, and render
  `<FontPreload />` in its `<head>`. Use the React components. They have no hooks, so they work in Server
  Components.
- **Tailwind 4**: `@import "tailwindcss"; @import "@kcc/design/tailwind.css";`. Only KC&C colours, sizes and
  radii exist after that.

## 15. Measured contrast

Generated by `npm run tokens`: WCAG 2.2 ratio (the gate) and APCA Lc (recorded), light and dark.

<!-- gen:contrast -->
| Pair | Use | WCAG needs | Light WCAG | Light APCA Lc | Dark WCAG | Dark APCA Lc | APCA target |
|---|---|---|---|---|---|---|---|
| `color.ink` on `color.paper` | Body text | 4.5:1 | 16.03 | 95.6 | 14.08 | -90.5 | 75 |
| `color.muted` on `color.paper` | Secondary text | 4.5:1 | 7.74 | 81 | 8.49 | -60.7 | 60 |
| `color.ink` on `color.paper-2` | Text on sunk area | 4.5:1 | 14.76 | 90.3 | 12.45 | -89 | 75 |
| `color.muted` on `color.paper-2` | Secondary text on sunk area | 4.5:1 | 7.13 | 75.7 | 7.50 | -59.2 (below) | 60 |
| `color.ink` on `color.field` | Text in inputs | 4.5:1 | 16.90 | 99.1 | 13.21 | -89.8 | 75 |
| `color.muted` on `color.field` | Units and hints in inputs | 4.5:1 | 8.16 | 84.5 | 7.96 | -59.9 (below) | 60 |
| `color.paper` on `color.ink` | Primary button label | 4.5:1 | 16.03 | -96.7 | 14.08 | 89.7 | 60 |
| `color.up` on `color.paper` | Diff chip and pill, better | 4.5:1 | 9.92 | 86.4 | 10.50 | -72.3 | 60 |
| `color.down` on `color.paper` | Diff chip and pill, worse; errors | 4.5:1 | 5.65 | 71.6 | 7.22 | -53.3 (below) | 60 |
| `color.watch` on `color.paper` | Pill, watch | 4.5:1 | 10.36 | 87.6 | 8.67 | -61.9 | 60 |
| `color.up` on `color.paper-2` | Diff chip on sunk area | 4.5:1 | 9.14 | 81.1 | 9.28 | -70.8 | 60 |
| `color.down` on `color.paper-2` | Diff chip on sunk area | 4.5:1 | 5.21 | 66.3 | 6.38 | -51.8 (below) | 60 |
| `color.watch` on `color.paper-2` | Watch text on sunk area | 4.5:1 | 9.54 | 82.3 | 7.66 | -60.3 | 60 |
| `color.rule` on `color.paper` | Section rules (graphic) | 3:1 | 16.03 | 95.6 | 11.49 | -77.4 | 30 |
| `color.control` on `color.paper` | Control borders (WCAG 1.4.11) | 3:1 | 5.21 | 70.5 | 4.45 | -33.6 | 30 |
| `color.control` on `color.field` | Control border against its fill | 3:1 | 5.49 | 74 | 4.17 | -32.9 | 30 |
| `color.ink` on `color.paper` | Focus ring (WCAG 2.4.13) | 3:1 | 16.03 | 95.6 | 14.08 | -90.5 | 30 |
| `chart.neutral` on `color.paper` | Baseline bars | 3:1 | 3.42 | 57.4 | 4.45 | -33.6 | 30 |
| `chart.up` on `color.paper` | Up bars | 3:1 | 9.92 | 86.4 | 10.50 | -72.3 | 30 |
| `chart.down` on `color.paper` | Down bars | 3:1 | 5.65 | 71.6 | 6.22 | -46.8 | 30 |
| `chart.watch` on `color.paper` | Limit lines | 3:1 | 10.36 | 87.6 | 8.67 | -61.9 | 30 |
| `categorical 1 (ink)` on `color.paper` | Series mark | 3:1 | 16.03 | 95.6 | 14.08 | -90.5 | 30 |
| `categorical 2 (green)` on `color.paper` | Series mark | 3:1 | 9.92 | 86.4 | 10.50 | -72.3 | 30 |
| `categorical 3 (red)` on `color.paper` | Series mark | 3:1 | 5.64 | 71.7 | 5.77 | -43.7 | 30 |
| `categorical 4 (blue)` on `color.paper` | Series mark | 3:1 | 4.78 | 67.8 | 6.60 | -49 | 30 |
| `categorical 5 (ochre)` on `color.paper` | Series mark | 3:1 | 3.21 | 54.9 | 9.31 | -65.6 | 30 |
| `categorical 6 (plum)` on `color.paper` | Series mark | 3:1 | 7.72 | 80.6 | 4.61 | -34.9 | 30 |
| `categorical 7 (mauve)` on `color.paper` | Series mark | 3:1 | 4.88 | 68.6 | 3.48 | -25.8 (below) | 30 |
| `categorical 8 (olive)` on `color.paper` | Series mark | 3:1 | 3.17 | 54.6 | 3.76 | -28.2 (below) | 30 |
| `sequential, darkest step` on `color.paper` | Highest value | 3:1 | 12.82 | 91.8 | 14.28 | -91.5 | 30 |
| `diverging, worse end` on `color.paper` | Worst value | 3:1 | 10.83 | 87.4 | 11.14 | -75.7 | 30 |
| `diverging, better end` on `color.paper` | Best value | 3:1 | 9.92 | 86.4 | 11.70 | -78.6 | 30 |
| `cell text (ink or paper)` on `diverging step 1` | Heatmap value | 4.5:1 | 10.83 | -90 | 11.14 | 76 | 60 |
| `cell text (ink or paper)` on `diverging step 2` | Heatmap value | 4.5:1 | 5.65 | -75.7 | 6.19 | 48.5 (below) | 60 |
| `cell text (ink or paper)` on `diverging step 3` | Heatmap value | 4.5:1 | 6.50 | 49.1 (below) | 5.21 | -70.1 | 60 |
| `cell text (ink or paper)` on `diverging step 4` | Heatmap value | 4.5:1 | 11.70 | 76.7 | 9.99 | -84.4 | 60 |
| `cell text (ink or paper)` on `diverging step 5` | Heatmap value | 4.5:1 | 14.76 | 90.3 | 12.12 | -88.7 | 60 |
| `cell text (ink or paper)` on `diverging step 6` | Heatmap value | 4.5:1 | 12.28 | 79.4 | 9.15 | -83.5 | 60 |
| `cell text (ink or paper)` on `diverging step 7` | Heatmap value | 4.5:1 | 7.13 | 52.6 (below) | 4.59 | -67.5 | 60 |
| `cell text (ink or paper)` on `diverging step 8` | Heatmap value | 4.5:1 | 4.98 | -73.2 | 6.79 | 52 (below) | 60 |
| `cell text (ink or paper)` on `diverging step 9` | Heatmap value | 4.5:1 | 9.92 | -89.2 | 11.70 | 78.7 | 60 |
| `cell text (ink or paper)` on `sequential step 1` | Heatmap value | 4.5:1 | 14.98 | 91.3 | 11.82 | -88.1 | 60 |
| `cell text (ink or paper)` on `sequential step 2` | Heatmap value | 4.5:1 | 12.28 | 79.4 | 9.15 | -83.5 | 60 |
| `cell text (ink or paper)` on `sequential step 3` | Heatmap value | 4.5:1 | 9.50 | 65.8 | 6.45 | -76 | 60 |
| `cell text (ink or paper)` on `sequential step 4` | Heatmap value | 4.5:1 | 7.13 | 52.6 (below) | 4.59 | -67.5 | 60 |
| `cell text (ink or paper)` on `sequential step 5` | Heatmap value | 4.5:1 | 4.89 | 38.1 (below) | 4.66 | 37.4 (below) | 60 |
| `cell text (ink or paper)` on `sequential step 6` | Heatmap value | 4.5:1 | 4.98 | -73.2 | 6.79 | 52 (below) | 60 |
| `cell text (ink or paper)` on `sequential step 7` | Heatmap value | 4.5:1 | 6.99 | -81.7 | 9.05 | 65.1 | 60 |
| `cell text (ink or paper)` on `sequential step 8` | Heatmap value | 4.5:1 | 9.92 | -89.2 | 11.70 | 78.7 | 60 |
| `cell text (ink or paper)` on `sequential step 9` | Heatmap value | 4.5:1 | 12.82 | -93.7 | 14.28 | 90.6 | 60 |
<!-- /gen:contrast -->

## 16. Brand *(convention)*

- **Two names.** KC&C is the firm: data, research, ratings. mero is the product family: lending, the mero rating.
  mero documents carry the mero lockup in the running header; KC&C stays named in the disclaimer.
- **Use the files.** Use `brand/logos/*.svg` or `<Logo name variant height>`. Never redraw, retype, trace or
  recolour a logo. The logos are EB Garamond outlines placed on the token grid by `scripts/build-brand.ts`
  (construction in `brand/README.md`).
- **Which logo.** The lockup on covers, letterheads and the first sheet. The wordmark in running headers and
  navigation. The monogram on social cards and seals. The icon only for favicons and app icons. The mero mark next
  to the wordmark, or alone as an app icon.
- **Colour.** Primary on paper (the mero mark in heavy green). One colour, ink, when only one colour prints.
  Reversed to paper only on the heavy green or on dark paper.
- **Clear space and size.** 21 units clear on every side. Minimum sizes: lockup 55 px, wordmark 13 px cap height,
  monogram 24 px, icons 16 px.
- Logo don'ts: Don'ts, 22, and the full list in `brand/USAGE.md`.
- **Icons and cards.** Favicons and app icons are in `brand/icons/` (16 to 512, maskable). Social cards use
  `brand/og/og-card.html`: the monogram, an eyebrow, the finding as the title, the date.
- **Original work only.** Do not imitate the logo, name, colours or layout of a real firm.
- **Usage and co-branding.** Clear space, minimum sizes, colour versions and the full do and don't list are in
  `brand/USAGE.md`. Never set a KC&C or mero logo in a client's palette or next to a client's logo without
  written permission. A KC&C document keeps the KC&C look, so it never looks like the client's own material.

## 17. Institutional documents

Our documents follow the conventions of rating agencies, bank research and central-bank reports
(`docs/institutional.md`, with sources). The templates (`/templates`) apply them:

- **Stamp every document.** Document number `KCC-<type>-<year>-<sequence>` (PR, RN, TS, MR, RR, DK, LT), version,
  issue date and status (`DocMeta`). A correction is a new version that states the change.
- **Mark confidentiality.** A page meant for a named counterparty carries "Confidential — for <name>" at the top
  and in the footer of every page (`ClassMark`, `Sheets`, `Slide`). Internal pages say "Internal". Public pages
  carry no mark.
- **Page furniture on sheets.** Running header: logo, title, classification. Running footer: number, version, date,
  "Page x of y". `Sheets` adds both, so no page leaves without them.
- **Number the exhibits.** "Figure 1", "Table 1", each with its source and date in the caption.
- **Source every fact.** Footnotes and evidence labels ([F], [I], [H], [P]).
- **End with "Important information".** What the document is not (advice, an offer, a commitment), who publishes
  it, conflicts, method version. Use `Disclaimer`, in the same place every time.
- **Rating reports** open with the action (grade, outlook, action, date, what the grade means), then rationale,
  metrics, sensitivities, history.
- **Term sheets** open with a status line ("indicative, non-binding, subject to contract"), then numbered defined
  terms, then schedules.
- **Decks:** one finding a slide, the number as the largest thing, only the cover in green, and number,
  confidentiality and "x / y" on every slide.
- **No crypto clichés** (Don'ts, 13; `docs/institutional.md`, section 3).
