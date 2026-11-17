# Colour: how it is built and the proof that it works

The owner wanted a heavy dark green and a heavy dark red on the KC&C cream paper. This page shows how we built
them and the rest of the palette, and what we measured. The tables between the `gen:` markers are written by
`npm run tokens` from `tokens/tokens.json`. The Colour page of the playground shows the same palette and the
sample charts in both themes.

## 1. The space: OKLCH

We define colours in OKLCH (Ottosson's OKLab in polar form): **L** lightness 0–1, **C** chroma, **H** hue in
degrees. OKLab is a model fitted by its author to existing colour-appearance data (CAM16 and others) to predict
lightness, chroma and hue; it is defined in CSS Color 4. We use it as a **tool** for building ramps with a fixed
lightness per step. We have no measurement that equal OKLab steps look equal on our paper for our readers, so
"perceptually uniform" here is the model's design goal, not a verified fact (docs/evidence.md).

- **Brand anchors stay exact.** Paper `#F3EFE4` (oklch 95.2% 0.015 90), ink `#141414` and muted `#4A4A46` are the
  KC&C site's colours and are kept as hex.
- **Every other colour is computed.** It is either a ramp step (`green.800`) or an explicit `oklch(L C H)`. The
  build converts each one to hex for the CSS. It maps out-of-gamut colours into sRGB by lowering chroma only
  (binary search), so lightness and hue stay as designed.

## 2. Ramps

Six ramps share eleven lightness steps, 50 (L 0.97) to 950 (L 0.21). Within a ramp the hue is fixed. Chroma
follows c(L) = c_max × (0.35 + 0.65 × sin(πL)): it is full in the middle and lower toward white and black, so the
light steps do not glow and the dark steps do not go muddy. The neutral ramp is "flat". It keeps a low chroma
(0.016) at every step, at the paper's hue (90°), so greys, hairlines and dark surfaces look like the same paper
in a different light.

<!-- gen:ramps -->
| Ramp | Hue | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| neutral | 90 | `#F9F5E9` | `#EAE6DA` | `#D5D1C5` | `#BBB7AC` | `#A29E93` | `#848076` | `#676359` | `#504D43` | `#3B382F` | `#29261E` | `#1B1810` |
| green | 163 | `#E0FEEE` | `#CCF0DE` | `#B0DDC6` | `#8FC6AB` | `#6FAE90` | `#4A9171` | `#277354` | `#075C3F` | `#00432D` | `#002F1E` | `#001F12` |
| red | 33 | `#FFF2EF` | `#FFDED6` | `#FFBFB1` | `#FD9882` | `#EA7962` | `#CE543C` | `#AD3118` | `#8E1900` | `#6A1000` | `#4C0900` | `#340400` |
| ochre | 78 | `#FFF3E2` | `#FDE2BA` | `#EDCC99` | `#D8B073` | `#C2964D` | `#A6761B` | `#835A00` | `#674600` | `#4C3200` | `#352200` | `#231500` |
| blue | 250 | `#EEF6FF` | `#D4E9FF` | `#B3D5F9` | `#92BCE7` | `#74A3D3` | `#5184B8` | `#32669A` | `#1B4F80` | `#053965` | `#00274A` | `#001932` |
| plum | 330 | `#FFF0FD` | `#FADBF6` | `#E9C3E5` | `#D4A6CF` | `#BE8BB9` | `#A16A9C` | `#834D7E` | `#6A3766` | `#51234E` | `#3C1439` | `#2A0728` |
| L (lightness) | | 0.97 | 0.925 | 0.86 | 0.78 | 0.7 | 0.6 | 0.5 | 0.42 | 0.34 | 0.27 | 0.21 |
<!-- /gen:ramps -->

## 3. Semantic colours

<!-- gen:semantic -->
| Token | Light | Light OKLCH | Dark | Dark OKLCH | Source (light / dark) |
|---|---|---|---|---|---|
| `--kc-paper` | `#F3EFE4` | oklch(95.2% 0.015 90.2) | `#1B1915` | oklch(21.5% 0.009 85.0) | #F3EFE4 / oklch(0.215 0.009 85) |
| `--kc-paper-2` | `#EAE6DA` | oklch(92.5% 0.016 90.0) | `#26241E` | oklch(26.0% 0.011 85.0) | neutral.100 / oklch(0.26 0.011 85) |
| `--kc-field` | `#F9F5E9` | oklch(97.0% 0.016 90.0) | `#211F1A` | oklch(24.0% 0.010 85.0) | neutral.50 / oklch(0.24 0.01 85) |
| `--kc-ink` | `#141414` | oklch(19.1% 0.000 89.9) | `#ECE6D6` | oklch(92.5% 0.022 87.0) | #141414 / oklch(0.925 0.022 87) |
| `--kc-muted` | `#4A4A46` | oklch(40.8% 0.007 106.7) | `#BAB4A5` | oklch(77.0% 0.022 87.0) | #4A4A46 / oklch(0.77 0.022 87) |
| `--kc-rule` | `#141414` | oklch(19.1% 0.000 89.9) | `#D5D1C5` | oklch(86.0% 0.016 90.0) | #141414 / neutral.200 |
| `--kc-hair` | `#BBB7AC` | oklch(78.0% 0.016 90.0) | `#3B382F` | oklch(34.0% 0.016 90.0) | neutral.300 / neutral.800 |
| `--kc-control` | `#676359` | oklch(50.0% 0.016 90.0) | `#848076` | oklch(60.0% 0.016 90.0) | neutral.600 / neutral.500 |
| `--kc-up` | `#00432D` | oklch(34.0% 0.073 163.0) | `#86D9B0` | oklch(82.0% 0.100 162.0) | green.800 / oklch(0.82 0.10 162) |
| `--kc-down` | `#AD3118` | oklch(50.0% 0.165 33.0) | `#F18A77` | oklch(74.0% 0.130 31.0) | red.600 / oklch(0.74 0.13 31) |
| `--kc-watch` | `#4C3200` | oklch(34.0% 0.071 78.0) | `#D8B073` | oklch(78.0% 0.092 78.0) | ochre.800 / ochre.300 |
| `--kc-chart-up` | `#00432D` | oklch(34.0% 0.073 163.0) | `#86D9B0` | oklch(82.0% 0.100 162.0) | green.800 / oklch(0.82 0.10 162) |
| `--kc-chart-down` | `#AD3118` | oklch(50.0% 0.165 33.0) | `#E47D6C` | oklch(70.0% 0.130 31.0) | red.600 / oklch(0.70 0.13 31) |
| `--kc-chart-neutral` | `#848076` | oklch(60.0% 0.016 90.0) | `#848076` | oklch(60.0% 0.016 90.0) | neutral.500 / neutral.500 |
| `--kc-chart-watch` | `#4C3200` | oklch(34.0% 0.071 78.0) | `#D8B073` | oklch(78.0% 0.092 78.0) | ochre.800 / ochre.300 |
| `--kc-chart-grid` | `#BBB7AC` | oklch(78.0% 0.016 90.0) | `#3B382F` | oklch(34.0% 0.016 90.0) | neutral.300 / neutral.800 |
<!-- /gen:semantic -->

**The green and the red.** "Up" is `green.800`: L 0.34, hue 163, a deep bottle green. "Down" is `red.600`: L 0.50,
hue 33, a brick red. They are both heavy, but not equally dark, on purpose. If both were at L 0.43 (the first
draft, `#1F5E3F` and `#8A2B1F`), a deuteranope would see them 5 apart (ΔE × 100). That is barely different. The
0.16 lightness gap and the move of red toward orange (hue 33) raise this to 19 for deuteranopia and 7 for
protanopia. Protanopes see red as darker, which closes part of the gap. Green and red are still not safe as the
only cue for protanopes, so the rules in section 6 apply.

The dark theme is designed, not inverted. Its paper is warm umber (L 0.215, hue 85). Ink is the cream paper
colour (L 0.925). Up and down are lighter steps chosen against the dark paper: green L 0.82 and red L 0.74 for
text, L 0.70 for red marks.

## 4. Chart scales

<!-- gen:scales -->
**light**

| Scale | Colours |
|---|---|
| Categorical | 1 ink `#141414`, 2 green `#00432D`, 3 red `#A93620`, 4 blue `#386CA0`, 5 ochre `#AD7C1D`, 6 plum `#6B3767`, 7 mauve `#7D6068`, 8 olive `#8D866B` |
| Sequential | `#CCF0DE` `#B0DDC6` `#8FC6AB` `#6FAE90` `#4A9171` `#277354` `#075C3F` `#00432D` `#002F1E` |
| Diverging | `#6A1000` `#AD3118` `#EA7962` `#FFBFB1` `#EAE6DA` `#B0DDC6` `#6FAE90` `#277354` `#00432D` |

**dark**

| Scale | Colours |
|---|---|
| Categorical | 1 ink `#ECE6D6`, 2 green `#86D9B0`, 3 red `#DD7766`, 4 blue `#6DA4D3`, 5 ochre `#E4B65C`, 6 plum `#A172AC`, 7 mauve `#946070`, 8 olive `#5A7F2B` |
| Sequential | `#002F1E` `#00432D` `#075C3F` `#277354` `#4A9171` `#6FAE90` `#8FC6AB` `#B0DDC6` `#CCF0DE` |
| Diverging | `#FFBFB1` `#EA7962` `#AD3118` `#6A1000` `#29261E` `#00432D` `#277354` `#6FAE90` `#B0DDC6` |
<!-- /gen:scales -->

- **Categorical (8).** Always in this order: ink, green, red, blue, ochre, plum, mauve, olive. A script searched
  OKLCH candidates (restrained chroma, at least 3:1 on paper). For each of the eight slots it kept the colour
  that gave the largest smallest-distance between any two colours, in normal vision and under the three
  simulations. Use 1–4 freely. Use 5–8 only with direct labels.
- **Sequential (9).** Green only, lightness from near paper to near ink. One hue that varies only in lightness
  reads the same in every colour vision.
- **Diverging (9).** Red (worse) to green (better) through a paper-coloured middle. Mirrored steps have the same
  lightness, so the darkness of a cell shows how far it is from the middle in any colour vision. The side
  (better or worse) is in the hue only. For readers with red-green colour blindness, the side must be shown
  another way (section 6).

## 5. Colour vision: measured

Simulation: Machado, Oliveira and Fernandes (2009), severity 1.0, one 3 × 3 matrix applied to linear sRGB.
Distance: Euclidean in OKLab × 100 (ΔE_OK). What the numbers can and cannot tell (docs/evidence.md):

- The simulation model is peer-reviewed. Its tritan matrix is weak (the authors say so), so tritanopia is
  reported, never gated.
- No study gives a ΔE_OK at which a colour-blind reader can tell two chart colours apart. The gate value, 2, is the
  JND constant that CSS Color 4 uses in its gamut-mapping algorithm. It is a **convention**, used only to catch a
  pair that has collapsed. Words like "clear" or "hard to tell apart" below are our reading, not a measurement.
- Because no threshold is evidence-based, meaning is never carried by colour alone (section 6, WCAG 2.2 SC 1.4.1).
  `npm run check` enforces this on the rendered pages (scripts/check-pages.ts).

<!-- gen:cvd -->
**light** (smallest OKLab distance x 100)

| Check | normal | protanopia | deuteranopia | tritanopia |
|---|---|---|---|---|
| Categorical, first 4 | 16.4 (ink/green) | 7.4 (green/red) | 14.9 (ink/green) | 16.5 (ink/green) |
| Categorical, first 6 | 16.1 (red/plum) | 7.4 (green/red) | 10.1 (green/plum) | 15.2 (red/plum) |
| Categorical, first 8 | 8.3 (ochre/olive) | 7.4 (green/red) | 8 (ochre/olive) | 8 (ochre/olive) |
| Up vs down (green vs red) | 27.2 | 7.2 | 19.4 | 31 |
| Diverging, mirrored steps | 12.1 | 5 | 3.4 | 14 |
| Diverging, neighbouring steps | 8.5 | 4.7 | 6.7 | 9.4 |
| Sequential, neighbouring steps | 6.6 | 6.2 | 6.5 | 6.6 |

**dark** (smallest OKLab distance x 100)

| Check | normal | protanopia | deuteranopia | tritanopia |
|---|---|---|---|---|
| Categorical, first 4 | 14.2 (ink/green) | 7.4 (ink/green) | 10.8 (ink/green) | 12.9 (green/blue) |
| Categorical, first 6 | 14 (blue/plum) | 7.4 (ink/green) | 7.9 (blue/plum) | 12.9 (green/blue) |
| Categorical, first 8 | 9.6 (plum/mauve) | 7.4 (ink/green) | 7.9 (blue/plum) | 7.7 (plum/mauve) |
| Up vs down (green vs red) | 22.4 | 16.9 | 8.7 | 27.2 |
| Diverging, mirrored steps | 12.1 | 5 | 3.4 | 14 |
| Diverging, neighbouring steps | 9.9 | 4.2 | 6.8 | 10.1 |
| Sequential, neighbouring steps | 6.6 | 6.2 | 6.5 | 6.6 |
<!-- /gen:cvd -->

### The gate: pairs that carry meaning, before and after simulation

`npm run tokens` fails if a pair below drops under the gate for protanopia or deuteranopia.

<!-- gen:cvd-gate -->
Gate: protanopia and deuteranopia distance at least 2 (OKLab x 100). Tritanopia is reported, not gated.

| Theme | Pair (carries meaning) | Normal | Protanopia | Deuteranopia | Tritanopia (info) | Gate |
|---|---|---|---|---|---|---|
| light | up vs down (text) | 27.2 | 7.2 | 19.4 | 31 | pass |
| light | up vs watch (text) | 9.8 | 5.4 | 5.4 | 12 | pass |
| light | down vs watch (text) | 20.3 | 9.4 | 17.1 | 22 | pass |
| light | chart up vs chart down | 27.2 | 7.2 | 19.4 | 31 | pass |
| light | baseline (neutral) vs subject (ink) | 40.9 | 40.8 | 41.2 | 41 | pass |
| light | categorical ink vs green | 16.4 | 17.1 | 14.9 | 16.5 | pass |
| light | categorical ink vs red | 34.5 | 24.1 | 33.4 | 36.9 | pass |
| light | categorical ink vs blue | 34.3 | 36.1 | 33.3 | 34.2 | pass |
| light | categorical green vs red | 26.4 | 7.4 | 18.9 | 30.1 | pass |
| light | categorical green vs blue | 21.7 | 21.5 | 20.5 | 18.1 | pass |
| light | categorical red vs blue | 24.3 | 19.6 | 19.3 | 28.5 | pass |
| light | diverging step 1 vs 9 (same lightness, opposite side) | 18.2 | 9.2 | 5.7 | 20.3 | pass |
| light | diverging step 2 vs 8 (same lightness, opposite side) | 23.2 | 11.8 | 8.2 | 29 | pass |
| light | diverging step 3 vs 7 (same lightness, opposite side) | 20.5 | 9.1 | 7.3 | 26.5 | pass |
| light | diverging step 4 vs 6 (same lightness, opposite side) | 12.1 | 5 | 3.4 | 14 | pass |
| dark | up vs down (text) | 22.4 | 16.9 | 8.7 | 27.2 | pass |
| dark | up vs watch (text) | 13.5 | 10.3 | 7.4 | 17.9 | pass |
| dark | down vs watch (text) | 10.1 | 8.5 | 3.8 | 9.6 | pass |
| dark | chart up vs chart down | 24.3 | 20.8 | 12.1 | 29 | pass |
| dark | baseline (neutral) vs subject (ink) | 32.5 | 32.2 | 32.5 | 32.5 | pass |
| dark | categorical ink vs green | 14.2 | 7.4 | 10.8 | 15.4 | pass |
| dark | categorical ink vs red | 27.3 | 30.1 | 24.3 | 28.5 | pass |
| dark | categorical ink vs blue | 25.2 | 22 | 26.2 | 25.9 | pass |
| dark | categorical green vs red | 25.3 | 22.8 | 13.9 | 29.8 | pass |
| dark | categorical green vs blue | 17.7 | 17.3 | 17.1 | 12.9 | pass |
| dark | categorical red vs blue | 21.2 | 16 | 16.3 | 26.9 | pass |
| dark | diverging step 1 vs 9 (same lightness, opposite side) | 12.1 | 5 | 3.4 | 14 | pass |
| dark | diverging step 2 vs 8 (same lightness, opposite side) | 20.5 | 9.1 | 7.3 | 26.5 | pass |
| dark | diverging step 3 vs 7 (same lightness, opposite side) | 23.2 | 11.8 | 8.2 | 29 | pass |
| dark | diverging step 4 vs 6 (same lightness, opposite side) | 18.2 | 9.2 | 5.7 | 20.3 | pass |
<!-- /gen:cvd-gate -->

What the numbers say:

- **Categorical:** the smallest distance among all eight colours stays at about 7 or more in every simulation, in both
  themes. The weakest pair is green and red for protanopes. Lines and areas are also labelled at their ends.
- **Up vs down:** clear in normal vision, deuteranopia and tritanopia. For protanopes it is about 7 in light and
  17 in dark: visible, but not enough to rely on.
- **Diverging, mirrored steps:** 3 to 5 for protanopia and deuteranopia. **We treat green ↔ red as unusable as the
  only cue for red-green colour blindness.** We say so and we add redundancy (below).
- **Sequential:** neighbouring steps are about 6 apart in every vision, because only lightness changes.

## 6. Redundancy rules (because green ↔ red is not enough)

1. **Text:** a change always has a sign or a word: "+10%", "−$1k", "no change", "24 h sooner". Colour repeats it.
2. **Centred-zero bars and columns:** the side of the zero line shows better or worse. The value is printed at the
   bar end with its sign.
3. **Heatmaps:** every cell prints its signed value. The scale key has words at both ends ("worse", "better").
4. **Status pills:** a word, and a marker shape that differs by state: square (OK), diamond (alert), triangle
   (watch), hollow (neutral), none and a dashed border (sample).
5. **Lines:** each series is named at its right end, so no colour has to be matched to a legend.

## 7. Contrast: measured

WCAG 2.2 contrast ratio is the gate: 4.5:1 for text, 3:1 for graphics and control borders. The build fails under
it. APCA Lc is recorded with a target (75 body text, 60 data and labels, 45 large text, 30 graphics). Pairs under
the APCA target are marked "(below)": they pass WCAG 2.2, and we will look at them again when WCAG 3 is final.
Heatmap cell text uses ink or paper, whichever contrasts more with that step in that theme. The build measured
this choice for every step (`--kc-seq-on-N`, `--kc-div-on-N`).

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

APCA notes: the dark theme's muted text (Lc about 60) and red text (Lc about 53) are under the body-text target.
They are used only for secondary labels and for bold diff chips, where the size and weight allow a lower Lc.
