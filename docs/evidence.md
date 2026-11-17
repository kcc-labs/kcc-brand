# Evidence: the basis of every rule

Design here is mathematics and measured UX research. That a rule is popular, or that other design systems use it,
is not a basis. Each rule in `DESIGN.md` rests on one of six bases. A rule with no row here does not exist.

| Basis | Meaning | Can change when |
|---|---|---|
| **Study** | A peer-reviewed measurement of reading, perception or use | New measurement contradicts it |
| **Standard** | A requirement of a published standard (W3C, ISO). The fact is "the standard requires X", not "X is perceptually best" | The standard changes |
| **Guideline (Apple HIG)** | A published guideline the owner chose as the design reference: Apple's Human Interface Guidelines, quoted with the page URL (`research/apple-hig.md`). Principles only, never Apple's visual identity. Not a measurement: where it conflicts with a study, the study wins | Apple changes the page, or the owner changes the reference |
| **Math** | Follows from arithmetic or geometry | Never, unless the inputs change |
| **CI** | Our own measurement, run by `npm run check` on every build | The measurement changes |
| **Convention** | Taste, brand or habit, with no study, standard, guideline or measurement behind it. Allowed, but labelled | The owner decides |

Confidence: **high** (replicated, or a normative text), **medium** (one primary study, or a study whose units do
not transfer exactly), **low** (the authors' suggestion, or an indirect inference). The study notes come from a
verified research run (17 Nov 2026: three independent votes per claim) and from reading the primary sources named
below. Claims that the verification refuted are not used anywhere.

## 1. Rules and their basis

### Typography

| Rule | Basis | Threshold | Source | Confidence | Gate |
|---|---|---|---|---|---|
| Running text (a p, li, dd or blockquote of 2+ lines) is at least 17 px | Study | ≥ 17 px | Rello, Pielot and Marcos, CHI 2016: comprehension worse at 10 and 12 pt than at 18 pt; the authors map 18 pt to about 24 px, so 12 pt ≈ 16 px on their 1024 × 768 screen. https://researchr.org/publication/RelloPM16 | medium (one study; px from the authors' screen, not a visual-angle conversion) | page gate `type.size`; build: `text.read`, `text.base` ≥ floor |
| The floor is not an optimum; larger may read better | Study | gains stop near 18–22 pt (≈ 24–29 px on their screen) | same | medium | none (documented) |
| Our reading size 19 px, app size 17 px | Convention (above the floor) | 19 / 17 px | — | — | — |
| Secondary text (notes, footnotes, captions, eyebrows, legal box) at 13 and 15 px | Convention, below the floor | 13 / 15 px | No study covers short reference text; Rello et al. suggest it reads worse | — | page gate warnings |
| Line height of running text at least 1.2 | Study | ≥ 1.2 × size | Rello et al. 2016: 0.8 × default (≈ 1.0) lowered comprehension; 1.0–1.8 × default had no effect on fixations | medium | page gate `type.line-height`; build: `leading.body`, `leading.data`, `leading.heading` ≥ 1.2 |
| Reading line height 1.55, data 1.4, headings 1.2, titles 1.08 | Convention | — | Any one exact value is convention (same study). Titles at 1.08 are display text, not running text | — | — |
| Measure about 67 characters (483 px at 19 px) | Convention (preference default) | 483 px | Dyson and Kipping 1998: readers preferred about 55 cpl, but 100 cpl was read faster than 25 cpl on screen; preference did not match performance. https://journals.uc.edu/index.php/vl/article/view/5671 | medium | — |
| Running text never ≤ 25 characters a line | Study | > 25 cpl | Dyson and Kipping 1998: 25 cpl slowest | medium (small N, CRT screens) | page gate `type.measure` at 320 and 1280 px; build: measure cpl |
| Characters per line = width / (measured advance × size) | Math + CI | 0.380 em for EB Garamond running text | `scripts/measure-font.ts`, `tokens/metrics.json` | high | `tokens:check` |
| Lining tabular figures in data | Math | — | Tabular figures share one advance width (OpenType `tnum`), so digits of one place align. No study on reading speed was verified | high (alignment); unverified (speed) | — |
| Serif for words, sans for data | Convention | — | No verified study; serif vs sans legibility is unverified | — | — |
| Type scale: text 13 + 2n px, display 13 × √φᵏ | Convention (exact arithmetic) | — | No study supports golden-ratio or modular scales; kept as the owner's taste | — | build checks the formulas |
| Uppercase only for short labels, 0.04–0.06 em tracking; no italics for emphasis | Convention | — | — | — | — |

### Layout and stability

| Rule | Basis | Threshold | Source | Confidence | Gate |
|---|---|---|---|---|---|
| No layout shift after first paint, with fonts delayed, fonts blocked and images delayed | CI (stricter than the standard) | any shift > 0 fails | Shift score = impact fraction × distance fraction (web.dev, Layout Instability API). Google's "good" CLS ≤ 0.1 is a field target at the 75th percentile, chosen from achievability data, not a perceptual threshold. A template we control can reach 0, and any lab shift has a cause we can fix. https://web.dev/articles/cls | high (definition); the 0 limit is our choice | page gate `layout-shift`, 24 pages × 2 viewports × 3 network conditions |
| EB Garamond latin embedded as a data URL and preloaded | CI | — | Measured: without the preload, Chrome painted one frame in the fallback over HTTP and shifted (0.0306 on the starter at 320 px) | high | page gate `layout-shift`, `font.embedded` |
| Other EB Garamond faces use `font-display: optional` | Standard (behaviour) + CI | — | CSS Fonts 4 §4.9: with optional, a font not ready in time is treated as if its block and swap periods expired, so it never swaps in later. https://www.w3.org/TR/css-fonts-4/ | high | page gate |
| Fallback serif sized to EB Garamond: size-adjust 94.31%, ascent 106.78%, descent 31.60%, line gap 0% | Math + Standard | computed | CSS Fonts 5 §4.4–4.5: size-adjust scales glyphs and every metric, including the overrides, so override = metric / unitsPerEm / size-adjust. https://www.w3.org/TR/css-fonts-5/ ; values from both fonts' tables by `scripts/measure-font.ts` | high (math); the fallback only shows if the embedded font fails | `tokens:check` |
| Every img has width and height; every chart SVG has a viewBox | Standard (behaviour) + CI | — | The browser reserves the box from the attributes or the viewBox before the image loads | high | page gate `layout.media-size` |
| Never insert content above content already shown | CI | — | Any such insert is a shift > 0 | high | page gate `layout-shift` |
| Scroll anchoring | Not used as a fix | — | CSS Scroll Anchoring (Editor's Draft) adjusts scroll position; it does not remove layout shifts. https://drafts.csswg.org/css-scroll-anchoring/ | — | — |
| No horizontal page scroll from 320 px | Standard | 320 CSS px | WCAG 2.2 SC 1.4.10 Reflow (AA) | high | page gate `layout.reflow` at 320 and 1280 px |
| Fibonacci spacing, 987 px page, 12 × 63 px grid, golden split 610 / 377 | Convention (exact arithmetic) | — | — | — | build checks the column is a whole pixel |
| Rules, not cards; no shadows; radius 0 | Convention | — | The HIG allows "negative space, container shapes, or separator lines" for grouping (Layout); we choose space and rules | — | page gate `budget.boxDepth`, `budget.borderAndBackground` |

### Colour

| Rule | Basis | Threshold | Source | Confidence | Gate |
|---|---|---|---|---|---|
| Text contrast ≥ 4.5:1, large text ≥ 3:1 | Standard | 4.5:1 | WCAG 2.2 SC 1.4.3 (AA). https://www.w3.org/TR/WCAG22/ | high (normative); its perceptual validation is not verified | `tokens:check`, 50 pairs × 2 themes |
| Graphics and control borders ≥ 3:1 | Standard | 3:1 | WCAG 2.2 SC 1.4.11 (AA) | high (normative) | `tokens:check` |
| APCA Lc recorded, not gated | Convention (draft method) | Lc 75 / 60 / 30 targets | APCA is a WCAG 3 draft candidate; WCAG 2 vs APCA validation is unverified | — | reported |
| Colour never the only means | Standard | — | WCAG 2.2 SC 1.4.1 Use of Color (A) | high | page gate `colour.redundancy`: chips, pills, up/down marks, heatmap cells |
| A change that rounds to zero is neutral | Math | "0%" has no sign | A value shown as zero has no side, so an up/down colour would be colour alone | high | page gate (caught 2 chips and 2 chart marks) |
| Colours defined in OKLCH; ramps at fixed OKLab L | Convention (tool) | — | OKLab is a model fitted to colour-appearance data (Ottosson 2020, https://bottosson.github.io/posts/oklab/); its uniformity for our use is unverified | — | — |
| CVD simulation: Machado 2009, severity 1, linear sRGB | Study | — | Machado, Oliveira and Fernandes, IEEE TVCG 2009 | medium (single model; qualitative validation) | `tokens:check` |
| Meaning pairs keep ΔE_OK × 100 ≥ 2 under protanopia and deuteranopia | Convention | ≥ 2 | 2 (0.02) is the JND constant in the CSS Color 4 gamut-mapping algorithm; no study gives a colour-blind discrimination threshold for chart colours | — | `tokens:check`, 30 pairs (docs/colour.md, the gate table) |
| Tritanopia reported, not gated | Study (limit) | — | Machado et al. handle tritan deficiency poorly; no Brettel 1997 implementation yet | — | reported |
| Red ↔ green is not a safe sole cue | CI | diverging mirrored steps 3.4–5 under simulation | `docs/colour.md` section 5 | medium | redundancy gate |
| Categorical order and max 4 colours without labels | Convention | — | — | — | — |

### Charts

| Rule | Basis | Threshold | Source | Confidence | Gate |
|---|---|---|---|---|---|
| Compare values by position on a common scale; no pies or bubbles for comparison | Study | position > length > angle, area | Cleveland and McGill 1984; Heer and Bostock 2010, https://homes.cs.washington.edu/~jheer/files/2010-MTurk-CHI.pdf ; Talbot et al. 2014. Angle was not shown worse than length | high | — |
| Aligned bars, not stacked bars, for comparisons; compared bars adjacent | Study | ≈ 0.8 pt more error for separated bars | Talbot, Setlur and Anand 2014, https://datavis.cs.columbia.edu/files/papers/talbot%20-%204%20experiments.pdf | medium (effects ≤ 1 pt) | no stacked-bar component exists |
| Sort bars by value; gaps between stacked segments | Convention (authors' untested suggestion) | — | same | low | — |
| Value axis ≥ 80 CSS px for value reading | Study | ≥ 80 px | Heer and Bostock 2010, exp. 3: 40 px gave more error; no gain above 80 px on a 0–100 scale | medium (2010 pixels; 0–100 scale) | page gate `chart.value-axis`; `charts/core.ts` raises heights |
| Gridlines help; at least 8 px apart | Study (gridlines) / low (8 px) | ≥ 8 px | Heer and Bostock 2010: gridlines improved accuracy; 8 px is the authors' inference from one ~4 px condition | low for the number | page gate `chart.grid-gap`; `gridTicks` |
| Banking to 45° is a heuristic, optional | Study | — | Heer and Agrawala 2006 (optimal only for two segments), https://homes.cs.washington.edu/~jheer/files/2006-Banking-InfoVis.pdf ; Talbot et al. 2012 (errors not lowest at 45°; flatter often better). Cleveland's 45° experiments as a sound basis: refuted in verification | high | — |
| Arc-length banking option | Math | — | Talbot, Gerth and Hanrahan 2011 (no perceptual validation) | high (math) | — |
| Default H / W = 1/φ², clamp [1/φ³, 1/φ] | Convention | — | — | — | — |
| Bars start at zero | Math | — | A bar's length is proportional to its value only from zero | high | `charts/core.ts` |
| Nice ticks (1, 2, 2.5, 5 × 10ⁿ) | Convention | — | Heckbert's algorithm | — | — |
| Direct labels over legends; legends only for heatmap scales and paired bars | Convention | — | Unverified in our research; the HIG names legends without a directive (Charts) | — | — |
| Sparklines are not for value reading | Convention | — | They are below the 80 px floor; the value is printed next to them | — | exempt from the chart gate |

### Interaction

| Rule | Basis | Threshold | Source | Confidence | Gate |
|---|---|---|---|---|---|
| Pointer targets ≥ 24 × 24 CSS px, or the spacing or inline exception | Standard | 24 × 24 | WCAG 2.2 SC 2.5.8 Target Size (Minimum), AA: "at least 24 by 24 CSS pixels", with Spacing, Equivalent, Inline, User agent and Essential exceptions | high | page gate `target.2.5.8` (spacing and inline exceptions implemented) |
| Controls 44 px high | Convention, from a standard | 44 px | WCAG 2.2 SC 2.5.5 Target Size (Enhanced), AAA, asks 44 × 44 | — | build: control height ≥ 24 |
| Visible 2 px ink focus ring | Standard | 2 px, 3:1 | SC 2.4.7 (AA) requires visible focus; SC 2.4.13 (AAA) sets the 2 px area and 3:1 | high | contrast pair |
| Motion 200–350 ms, one easing; off with reduced motion | Convention | — | Response-time limits (Miller 1968, Card et al.) were not verified; no rule uses them | — | — |
| Motion only as feedback to the reader's action | Guideline (Apple HIG) | — | Motion: "Add motion purposefully, supporting the experience without overshadowing it. Don't add motion for the sake of adding motion." https://developer.apple.com/design/human-interface-guidelines/motion | normative for the HIG; not measured | — |
| Fitts's law, Hick–Hyman law | Not used | — | Not verified in our research; no rule depends on them | — | — |
| One primary button a view; segmented control for 2–4 choices; labels above fields | Convention | — | The HIG allows "one or two per view" prominent buttons (Buttons); one is inside that range | — | — |
| Status messages in `aria-live="polite"` | Standard | — | WCAG 2.2 SC 4.1.3 Status Messages (AA) | high | — |

### Simplicity and don'ts

The Don'ts list in `DESIGN.md` and the complexity budget. HIG quotes are from the pages read on 17 Nov 2026
(`research/apple-hig.md`).

| Rule | Basis | Threshold | Source | Confidence | Gate |
|---|---|---|---|---|---|
| Remove the unnecessary; every element earns its place; one idea per section | Guideline (Apple HIG) | — | Design principles, Simplicity: "A well-designed experience removes the unnecessary, with every element earning its place." "Include just what's necessary. Simplicity isn't minimalism." https://developer.apple.com/design/human-interface-guidelines/design-principles | normative for the HIG; not measured | budget below |
| Important content first; the heading is the finding | Guideline (Apple HIG) | — | Layout: "Order content by relative importance." https://developer.apple.com/design/human-interface-guidelines/layout ; Writing: "put the most important information first." https://developer.apple.com/design/human-interface-guidelines/writing | normative for the HIG | — |
| No decoration without a job | Guideline (Apple HIG) | — | Design principles, Delight: "Don't mistake delight for decoration." | normative for the HIG | — |
| At most one accent colour a view; state colours only for state | Guideline (Apple HIG) + convention (the number one) | 1 | Color: "reserve it for elements that truly benefit from emphasis, such as status indicators or primary actions"; "Avoid using the same color to mean different things." https://developer.apple.com/design/human-interface-guidelines/color | normative for the HIG; the number is ours | budget `accentColours` counts all non-neutral colours |
| No chart and table of the same numbers on one page; the table goes in an appendix | Guideline (Apple HIG) | — | Charting data: "Keep a chart simple, letting people choose when they want additional details." https://developer.apple.com/design/human-interface-guidelines/charting-data . WCAG 2.2 SC 1.1.1 is met by the chart's name and each mark's `<title>`, so the table is not needed next to the chart | normative for the HIG | — |
| No subjective words about data; give values | Guideline (Apple HIG) | — | Charts: "Avoid using subjective terms ... use actual values in your descriptions." https://developer.apple.com/design/human-interface-guidelines/charts | normative for the HIG | — |
| No critical value only on hover or a click | Guideline (Apple HIG) | — | Charts: "don't require interaction to reveal critical information." | normative for the HIG | — |
| No light font weights | Guideline (Apple HIG) | ≥ 400 | Typography: "In general, avoid light font weights." https://developer.apple.com/design/human-interface-guidelines/typography | normative for the HIG | tokens define 400, 500, 600 only |
| Plain words; no "click here"; no interjections or blame in errors; no marketing words | Guideline (Apple HIG) + convention (the word list) | — | Writing: "Check each word to be sure it needs to be there"; "Choose simple, plain language"; "avoid the temptation to be too cute or clever"; "Avoid using 'Click here'"; "Interjections like 'oops!' ... can sound insincere"; "avoid blame" | normative for the HIG | — |
| No "we" in app interface text; documents may say "we" | Guideline (Apple HIG) | — | Writing: "Avoid using *we* altogether because it may be unclear who the 'we' in question refers to." In a document the masthead and disclaimer name KC&C, which removes the ambiguity | normative for the HIG | — |
| No icon without a visible text label | Convention (stricter than the HIG) | — | Buttons allows icon-only buttons for familiar actions; the owner keeps visible labels. The accessible name is WCAG 2.2 SC 4.1.2 (A) | — | — |
| No area fill under a line whose value axis does not start at zero | Math | — | A filled area is read as an amount from its baseline; from a non-zero baseline the area is not proportional to the value (the same geometry as bars) | high | — |
| Complexity budget: at most 7 font sizes a page | Convention | > 7 fails, 7 warns | Seven type roles (secondary, data, body, lede, section, figure, title). The HIG says to "Minimize the number of typefaces" (Typography), not a size count | — | page gate `budget.fontSizes` |
| At most 6 non-neutral colours a page (OKLab chroma ≥ 0.04; a heatmap ramp counts once) | Convention | > 6 fails, 6 warns | Up, down, watch plus three series colours | — | page gate `budget.accentColours` |
| No bordered box inside a bordered box | Convention | depth > 1 fails | Controls, pills, sheets and slides are not boxes | — | page gate `budget.boxDepth` |
| No element other than a control with both a border and a background | Convention | > 0 fails | That is a card | — | page gate `budget.borderAndBackground` |
| Headings at most 12 words | Convention (from the HIG's "Be concise") | > 12 fails, 11–12 warn | Design principles: "Choose exactly the words you need" | — | page gate `budget.headingWords` |

**Where the HIG conflicts with our evidence.** Typography and Accessibility give an iOS minimum text size of 11
pt and a default of 17 pt. Our running-text floor (17 px) comes from a study (Rello, Pielot and Marcos 2016), so
it stays; the HIG minimum applies to short interface labels, which are our secondary text (13 and 15 px,
convention). No other HIG rule conflicts with a study or a standard we use; the HIG contrast values are the WCAG
AA values we already gate. Differences with conventions are resolved in `research/apple-hig.md`, section 3.

## 2. What the gates caught on 17 Nov 2026 (first run)

Page gate (`scripts/check-pages.ts`), 24 pages × 2 viewports × 3 network conditions = 144 loads, before fixes:

- **Layout shift:** 14 loads shifted, all from the web-font swap (`display=swap`): starter at 320 px 0.0306
  (the title rewrapped by one line), monthly report 0.0222, templates index 0.0068, mero quote 0.0001, research
  note < 0.0001. Switching to `font-display: optional` removed the shifts, but then EB Garamond was never used on a
  first view (the gate now checks this: `font.embedded`). Embedding the latin face alone still shifted over HTTP
  (Chrome painted one fallback frame). Embedding plus a preload of the same data URL: 0 shifts, EB Garamond in use.
- **Running text under 17 px:** 32 findings: callouts (scope, risk, status) and term-sheet terms at 15 px. Fixed:
  callouts and terms now use `base` (17 px). Footers are secondary text (warnings).
- **Measure ≤ 25 cpl:** 6 findings: the New York disclosure box cells on 320 px phones (18–19 cpl) and term-sheet
  terms (25 cpl). Fixed: one column under 480 px; terms take the full width on phones.
- **Colour alone:** 16 findings: a "0%" change chip in the down colour, and chart marks titled "0%" / "0.0%" in the
  up/down colours. Fixed: values that round to zero take the neutral tone (`shownZero`). The checker also had to
  accept a word ("no liquidations") as the side.
- **Horizontal page scroll at 320 px** (added during the review): 4 findings: the two-column block (rating report,
  331 px), a callout with long code on the home page (375 px), the logo construction figure (529 px). Fixed: the
  column minimum is `min(100%, 288px)`, callouts are `minmax(0, 1fr)` on phones, the figure scrolls in its own box.
- **Targets, chart axis and gridlines:** 0 findings.

Token gate (`build-tokens.ts`): the light "watch" ochre (`ochre.700`) and "down" red fell to ΔE_OK × 100 = 1.9
under protanopia. Fixed: watch is `ochre.800` (now 9.4; up vs watch 5.4).

Secondary text below the running-text floor remains as 173 warnings (notes 15 px, footers and captions 13 px, the
deck at 320 px). It is a convention we keep and label, not a pass.

Complexity budget, first run (17 Nov 2026): the final gate on the pages as they were, then after the audit. 25
pages; a page counts once if either viewport is over.

| Count (fails above) | Pages over before | Causes | After |
|---|---|---|---|
| Font sizes (7) | 10 | Off-scale sizes from `code` at 0.875 em and footnote marks at 0.65 em (11.5–12.5 px); the proposal's scope callout at 17 px beside 19 px text; showcase styles at 11, 12 and 14 px; slide header and footer at two sizes; specimens not marked | 0 |
| Non-neutral colours (6) | 2 | Colour page and showcase specimens (107 and 27); monthly report and dashboard sat at 6 (heatmap beside a stacked area) | 0 |
| Box depth (1) | 2 | Logo tiles and swatches (specimens) | 0 |
| Border and background (0) | 8 | Flow steps tinted "yours" in a framed strip (3 pages), 36 bordered logo tiles, swatches, showcase tiles | 0 |
| Heading words (12) | 4 | Home 15, tokens 16, rating report 13 (two pages) | 0 |

Failures 49 → 0; budget warnings 37 → 16. What the audit removed: 13 duplicated numbers or columns (proposal rows
for capacity and bad debt, deck bad-debt row, monthly-report figures for depth and near-liquidation debt,
research-note key data for depth and change, rating rationale figures, two hex columns on the Tokens page, the
scenario table moved to an appendix), 3 charts (dashboard weekly columns and heatmap, monthly-report heatmap), 2
legends that repeated the stacked area's end labels, 1 area fill on a non-zero axis, 1 sparkline column and its
group header row, 4 designer captions and notes, 4 decorative figures on the home page, 4 repeated "sample data"
lines, the proposal's scope callout (folded into the lede), the flow strip's frame and tint, the logo-tile and
showcase-tile borders, and 10 headings shortened or rewritten as findings.

## 3. Topics without verified evidence

No claim survived verification, so no rule may cite them as evidence: OKLCH/CIELAB uniformity for our use; WCAG 2
vs APCA validation against reading performance; safe red/green palettes and a ΔE threshold for colour-blind
readers; serif vs sans; tabular numerals and reading speed; golden-ratio or modular scales; zero baselines beyond
the geometry of bars; direct labels vs legends; Fitts's law and Hick–Hyman parameters for our controls;
response-time limits (0.1 / 1 / 10 s); the Apple HIG (a published guideline, not a measurement: used under
its own basis, never cited as a study); print and PDF reading (all typography evidence above is on screen); and
whether the 2016 and 1998 screen results hold on high-density displays. Standards in this list are cited only as
what they require.

## 4. How to add or change a rule

1. Find the basis. A study needs a primary source and a stated effect; a standard needs the clause; mathematics
   needs the derivation. Otherwise the rule is a convention, and it says so.
2. Add a row above, then the rule in `DESIGN.md` with its label. Put any number in `tokens.json` →
   `evidence.floors` if CI should check it.
3. If CI can measure it, add the check to `scripts/build-tokens.ts` (tokens) or `scripts/check-pages.ts` (pages),
   and a violation to `scripts/fixtures/gate-violations.html` so the self-test proves the check fires.
