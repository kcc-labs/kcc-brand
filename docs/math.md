# The maths behind the tokens

Each number in the system comes from a formula in `scripts/lib/tokens.ts`. The parameters are in
`tokens/tokens.json`. Do not type sizes by hand: change a parameter, run `npm run tokens`, and read the result
here. The tables between the `gen:` markers are written by the build. `npm run check` fails if they are stale.

φ (phi) = (1 + √5) / 2 = 1.6180… . √φ = 1.2720… .

## 1. Type scale

### Why two scales

The KC&C site uses φ: 13, 21, 34, 55, 89. Each size is 1.618 times the size before it. This is an aesthetic
convention: no study we know of shows that a golden-ratio (or any modular) scale reads better than another set of
sizes (docs/evidence.md). We keep it because the owner likes the proportions, and the arithmetic below is exact.

φ is too steep for small text. From 13 px, the next φ step is 21 px. That skips every size we need for reading
and data: 15 px tables, 17 px app text, 19 px serif text. A gentler ratio fills the gap but gives display sizes
that are too close together. Compare, from 13 px:

| Ratio | Name | Steps from 13 px |
|---|---|---|
| 1.200 | minor third | 13, 15.6, 18.7, 22.5, 27.0, 32.3, 38.8, 46.6, 55.9 |
| 1.250 | major third | 13, 16.3, 20.3, 25.4, 31.7, 39.7, 49.6, 62.0, 77.5 |
| 1.333 | perfect fourth | 13, 17.3, 23.1, 30.8, 41.0, 54.7, 72.9, 97.2 |
| 1.500 | perfect fifth | 13, 19.5, 29.3, 43.9, 65.8, 98.7 |
| 1.272 | √φ | 13, 16.5, **21.0**, 26.8, **34.0**, 43.3, **55.1**, 70.0, **89.1** |
| 1.618 | φ | 13, **21.0**, **34.0**, **55.1**, **89.1**, 144.2 |

The 1.25 and 1.333 scales give good text sizes. But they miss the KC&C display sizes (21, 34, 55, 89), and the
owner's site and the proposal use those. √φ has every φ size at its even steps and a half step between each pair.

**Our choice:**

- **Display sizes** (21 px and up): 13 × √φᵏ. Even k gives the KC&C golden sizes (21, 34, 55, 89). Odd k gives the
  half steps the proposal needs: 27 for h2 and 43 for figures. k = 7 (70 px) is not used.
- **Text sizes** (13 to 19 px): 13 + 2n. At these sizes a 2 px step is what the eye notices. A ratio would give
  fractional sizes (16.5) that round badly on screen. EB Garamond has a small x-height (0.40 em, measured
  below), so serif reading text needs 19 px to read like 17 px of a sans.

<!-- gen:type -->
| Token | Formula | Exact | Used (px) | Line height | Use |
|---|---|---|---|---|---|
| `--kc-text-xs` | 13 + 0 x 2 | 13 | 13 | 1.4 = 18 px | Eyebrows, table headers, chart text, footnotes, pills. |
| `--kc-text-sm` | 13 + 1 x 2 | 15 | 15 | 1.4 = 21 px | Data: tables, notes, labels, controls, nav. |
| `--kc-text-base` | 13 + 2 x 2 | 17 | 17 | 1.4 = 24 px | Body text in apps; inputs. |
| `--kc-text-read` | 13 + 3 x 2 | 19 | 19 | 1.55 = 29 px | Reading text in documents (EB Garamond has a small x-height). |
| `--kc-text-lg` | 13 x sqrt(phi)^2 | 21.03 | 21 | 1.2 = 25 px | Lede under the page title. |
| `--kc-text-xl` | 13 x sqrt(phi)^3 | 26.76 | 27 | 1.2 = 32 px | Section heading (h2). |
| `--kc-text-2xl` | 13 x sqrt(phi)^4 | 34.03 | 34 | 1.08 = 37 px | Page title on phones and in apps; compact figures. |
| `--kc-text-3xl` | 13 x sqrt(phi)^5 | 43.29 | 43 | 1.08 = 46 px | Figures in a figure row. |
| `--kc-text-4xl` | 13 x sqrt(phi)^6 | 55.07 | 55 | 1.08 = 59 px | Page title in documents. |
| `--kc-text-5xl` | 13 x sqrt(phi)^8 | 89.1 | 89 | 1.08 = 96 px | One hero number, at most once per page. |
<!-- /gen:type -->

The lede is set at 1.45, not 1.2: it is reading text that happens to be large.

## 2. Spacing

Fibonacci, from the seed 5, 8: each step is the sum of the two before it. The ratio of consecutive steps tends
to φ, so spacing and display type grow at the same rate. 13, 21, 34, 55 and 89 are both spaces and sizes. A
section's 55 px gap equals the page title's size, and the 13 px rule-to-heading gap equals the eyebrow's size.

<!-- gen:space -->
| Token | px | Ratio to previous | Use |
|---|---|---|---|
| `--kc-s1` | 5 | seed | Label to value; inside a pill. |
| `--kc-s2` | 8 | 1.600 | Inside a block: cell padding, list gaps. |
| `--kc-s3` | 13 | 1.625 | Section rule to its heading; figure padding. |
| `--kc-s4` | 21 | 1.615 | Between blocks inside a section; grid gutter; page gutter on phones. |
| `--kc-s5` | 34 | 1.619 | Masthead to title; gap between columns; page gutter on wide screens. |
| `--kc-s6` | 55 | 1.618 | Between sections. |
| `--kc-s7` | 89 | 1.618 | End of page. |
| `--kc-s8` | 144 | 1.618 | Rare: hero air. |
| | | phi = 1.618 | |
<!-- /gen:space -->

## 3. Baseline grid: a rhythm, not a lock

A strict baseline grid sets every line height and every space to a multiple of one unit (4 or 8 px). We do not
use one, for three reasons:

1. The Fibonacci steps (5, 8, 13, 21, 34) have no common unit above 1 px. A 4 px grid would turn 13 into 12 or 16
   and 21 into 20 or 24, and the golden ratio between steps would be lost.
2. Pages mix a serif at 19/29 px with a sans at 15/21 px and 13/18 px in tables. No one unit fits all three.
3. On the web, a font's line box does not land its baseline on a grid without trimming hacks
   (`text-box-trim` is not yet in every browser). A grid that is off by one in some browsers is worse than none.

What we keep instead:

- **Whole-pixel line heights** for each size (table above), so lines do not drift by sub-pixels down a page.
- **Rhythm from the rules.** Each section starts with a 1 px rule, 55 px below the last content, and the heading
  is 13 px under the rule. The eye reads the rhythm from the rules, as on a printed form.
- **Fixed row heights.** Table cells have 8 px above and below a 21 px line (15 px text). A row is 37 px plus its
  1 px hairline, so rows line up across the whole table.

## 4. Measure (characters per line)

Bringhurst's 45 to 75 characters (66 "ideal") is a typographer's preference, not a measured speed rule. The
on-screen evidence we have: 100-character lines were read faster than 25-character lines, and readers preferred
about 55 characters although it did not make them faster (Dyson and Kipping 1998). So we keep about 67 characters
as a **preference default**, and we gate only the floor: running text never has 25 characters a line or fewer
(`evidence.floors.minCharsPerLine`, checked on every rendered page at 320 px and 1280 px). We measured EB Garamond
instead of guessing (`scripts/measure-font.ts` reads the woff2 we ship). It takes the advance width of each
letter and weights it by English letter frequency (Lewand). Then it adds spaces (18%), capitals, digits and
punctuation in proportions that are typical of our reports. The result is in `tokens/metrics.json`:

- EB Garamond running text: **0.380 em a character**. x-height 0.40 em, cap height 0.65 em.
- 19 px across the golden column (610 px) = **84 characters**. This is too long, so we rejected it for text.
- 19 px across 6 grid columns (483 px) = **67 characters**. This is our `--kc-measure`.
- The 21 px lede across the same 483 px = 60 characters.
- 15 px sans notes across 7 columns (567 px) ≈ 76 characters. This is `--kc-measure-wide`. The system sans
  differs by platform, so we use an estimate of 0.5 em a character.

Characters per line = measure / (advance in em × font size).

### Fallback metrics (no text jump)

`scripts/measure-font.ts` also reads the fallback serif (Times New Roman; Liberation Serif has the same metrics)
and computes the `@font-face` overrides of "EB Garamond Fallback" (CSS Fonts 5, sections 4.4–4.5: size-adjust
scales every metric, including the overrides, so each override is divided by size-adjust):

- size-adjust = EB Garamond running-text advance / fallback running-text advance (same letter mix as above).
- ascent-override = EB Garamond ascent / unitsPerEm / size-adjust; descent and line gap the same way. EB Garamond
  sets OS/2 USE_TYPO_METRICS, so its typo metrics are used.

The values are in `tokens/metrics.json` (`fallbackOverrides`) and `packages/design/css/tokens.css`. The fallback is
only what a reader sees if the embedded font fails; the page gate shows no layout shift either way.

## 5. Page and grid

- **Page** = F(16) = 987 px, the KC&C site's width.
- **Golden split**: 987 / φ = 610 (main) and 987 − 610 = 377 (aside). Both are Fibonacci numbers, so the split is
  exact. `.kc-split` puts an aside (a form, notes) beside the main column (a result, a chart).
- **12-column grid** with the 21 px (s4) gutter: column = (987 − 11 × 21) / 12 = **63 px exactly**. The build stops
  if a change in parameters makes the column a fraction of a pixel. Spans: 6 columns = 483 (the measure), 7 = 567
  (the wide measure), 8 = 651, 12 = 987.

<!-- gen:layout -->
| Token | px | Formula | Use |
|---|---|---|---|
| `--kc-page` | 987 | F(16) | Max width of the page content. |
| `--kc-golden` | 610 | page / phi | The wide side of the golden split: the main column beside an aside. |
| `--kc-aside` | 377 | page - golden | The narrow side of the golden split: margin notes, a form beside a result. |
| `--kc-measure` | 483 | 6 of 12 columns | Max width of serif reading text and the lede (about 66 characters). |
| `--kc-measure-wide` | 567 | 7 of 12 columns | Max width of sans notes and footnotes (about 75 characters). |
| `--kc-column` | 63 | (page - 11 x gutter) / 12 | One column of the 12-column grid. |
| `--kc-grid-gutter` | 21 | s4 | Gap between grid columns. |
| `--kc-control-height` | 44 | touch target | Buttons, inputs, selects, segmented control. |
<!-- /gen:layout -->

The page gutter (`--kc-gutter`) is s4 (21 px) under 640 px and s5 (34 px) above.

## 6. Chart aspect ratio: banking (a heuristic)

Cleveland, McGill and McGill (1988) proposed banking line segments to 45°. Later work limits that claim: 45° is
optimal only for two segments (Heer and Agrawala 2006); Talbot, Gerth and Hanrahan (2012) measured that
slope-ratio errors are generally not lowest at 45° and that flatter charts often do better. So banking is an
option, never forced. For a line chart, `lineChart({ height: "bank" })` chooses the height from the data:

1. For each segment i, normalise to the data ranges: sᵢ = |Δyᵢ / y-range| / |Δxᵢ / x-range|.
2. On screen the slope is sᵢ × (H / W). We want the median slope to be 1 (45°), so **H / W = 1 / median(sᵢ)**.
3. Clamp H / W to [1/φ³, 1/φ] = [0.236, 0.618] (a convention). A very noisy series would otherwise give a
   near-square chart, and a smooth one a sliver.

`lineChart({ height: "arc" })` uses arc-length banking (Talbot, Gerth and Hanrahan 2011): with the data normalised
to [0, 1] and a plot of area 1 (width 1/√a, height √a, a = H / W), choose a to minimise the drawn length
L(a) = Σ √(Δxᵢ² / a + Δyᵢ² · a). L is convex in log a, so a golden-section search finds it. It has clean
mathematical properties; its authors note it has no perceptual validation. Same clamp.

**Size floors.** Whatever the ratio, `lineChart`, `columns` and `stackedArea` raise the height so the value axis is
at least 80 CSS px at the narrowest drawn width (the SVG shrinks to 520 px before it scrolls), and `gridTicks`
drops ticks until gridlines are at least 8 CSS px apart (Heer and Bostock 2010; docs/evidence.md).

Without banking, charts default to H / W = 1/φ² = 0.382 (720 × 275), a convention. Bar charts do not bank: their height comes
from the number of rows (18 px bars, 12 px gaps for centred-zero bars, 13 + 2 + 13 px pairs for paired bars).

Scales use Heckbert's "nice numbers" (a convention): tick steps of 1, 2, 2.5 or 5 × 10ⁿ, about five ticks. Centred-zero bars use a
symmetric domain, so zero is in the middle and the two sides are comparable. Bars and amounts start at zero;
prices may start where the data does (`zero: false`), and the axis says so with its first tick.

## 7. Colour

The colour maths (OKLCH ramps, the chroma curve, gamut mapping, WCAG, APCA, colour-vision simulation) is in
docs/colour.md, with the measured tables.

## 8. How to change a number

1. Edit the parameter in `tokens/tokens.json` (for example `layout.readColumns`, `type.anchor`, `space.seed`).
2. Run `npm run tokens`. It rewrites the CSS, the TypeScript module, the Tailwind presets, the HTML kit, the
   report and the tables in this file, DESIGN.md and docs/colour.md. It also re-measures the font.
3. Run `npm run check`. It fails if a contrast pair drops under WCAG 2.2, if a meaning pair collapses under
   colour-vision simulation, if a token breaks an evidence floor, if the grid column is not a whole pixel, if a
   generated file is stale, or if a rendered page shifts or breaks a floor (`scripts/check-pages.ts`).
