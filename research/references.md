# References

What we studied, what each source teaches, and what we adopt or reject. Each link was opened by script on
17 Nov 2026 and answered HTTP 200, except edwardtufte.com, which refuses scripts (403); its books are cited by
title. The notes come from our reading of each source, not from quotes.

## Design systems

### IBM Carbon, data visualization
- https://carbondesignsystem.com/data-visualization/getting-started/
- https://carbondesignsystem.com/data-visualization/color-palettes/

**Teaches.** A chart is part of the product, not a picture. Carbon fixes an order for categorical colours, so
series 1 is always the same colour. It keeps colour scales apart by job (categorical, sequential, diverging,
alert). It tests its palettes for contrast and for colour-blind readers. It limits a chart to a few colours and
recommends direct labels over legends.

**Adopt.** A fixed categorical order (`--kc-cat-1` to `-8`). Separate sequential and diverging scales. A rule that
series 5 to 8 need direct labels. Palette checks that run in the build, not by hand.
**Reject.** Carbon's bright, high-chroma palette and its 2 px rounded cards. Both fight the paper look.

### GOV.UK Design System
- https://design-system.service.gov.uk/styles/type-scale/
- https://design-system.service.gov.uk/styles/colour/

**Teaches.** Plain words. One thing per page. Each colour has a named job, and nothing else uses it. Error
messages say what to do. Type is responsive, with fewer, larger steps on small screens. The focus state is easy
to see on every control.

**Adopt.** The copy voice (DESIGN.md, Copy). Error text that tells the reader how to fix the problem. One primary
action per view. A strong focus ring (2 px ink). Colours with jobs, never decoration.
**Reject.** The yellow focus highlight and the government blue. Our focus ring is ink, so it matches the paper.

### US Web Design System (USWDS)
- https://designsystem.digital.gov/design-tokens/color/overview/

**Teaches.** The "magic number": every colour has a grade (0 to 100, by luminance). Any two grades that differ by
50 or more pass WCAG AA for text, whatever the hue. Contrast becomes arithmetic, not trial and error.

**Adopt.** Fixed lightness per ramp step, so two steps a set distance apart behave alike in every hue. We use
OKLCH lightness (see Material and Ottosson below) instead of luminance grades, and we measure every pair.
**Reject.** Their system blue as a brand colour.

### Material 3, colour science
- https://m3.material.io/styles/color/system/how-the-system-works
- https://material.io/blog/science-of-color-design

**Teaches.** Tonal palettes in a perceptual colour space (HCT). Tone, not hue, sets contrast. Dark themes use
different tones from light themes; they do not invert the light colours.

**Adopt.** Tonal ramps with fixed lightness. A dark theme with its own tones, chosen by measurement.
**Reject.** HCT itself. We use OKLCH: it is in CSS Color 4, browsers support it, and it is enough for our ramps.
We also reject dynamic colour from wallpaper: the KC&C paper and ink are brand anchors.

### Radix Colors
- https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale

**Teaches.** Each step of a scale has a job (backgrounds, borders, solid fills, text). Grey scales are tinted
toward the hue they sit beside, so they do not look dead.

**Adopt.** Warm greys: our neutral ramp uses the paper's hue (90°) at a flat, low chroma, so rules and hairlines
belong to the paper.
**Reject.** Twelve steps per ramp. We need eleven and use far fewer.

### Stripe and Linear (product UI and docs)
- https://docs.stripe.com/
- https://linear.app/now/how-we-redesigned-the-linear-ui

**Teaches.** Stripe's docs put every code sample next to its live result, and the samples are correct. Linear
redesigned toward less colour, more contrast in text and fewer borders, and generates themes from a few inputs.

**Adopt.** The playground shows each component next to its code. The HTML is read from the rendered component,
so it cannot drift. Themes come from a few parameters.
**Reject.** Linear's dark-first, glassy surfaces, and the soft rounded panels of most product UIs.

## Charts

### Financial Times, Visual Vocabulary and chart style
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- https://ft-interactive.github.io/visual-vocabulary/

**Teaches.** First decide what relation the chart shows (deviation, correlation, ranking, distribution, change
over time, magnitude, part to whole, spatial, flow), then pick the form. FT charts sit on a tinted paper
background with the heading as a finding, the subtitle as measure and unit, and the source at the foot.

**Adopt.** The page anatomy: eyebrow = measure, unit and basis; heading = the finding as a sentence; note = source
and date. Centred-zero bars for deviation. Paired bars for before and after. Columns for change over time.
Stacked area for part to whole.
**Reject.** Pie charts and donuts. We have none.

### The Economist, chart style guide
- https://design-system.economist.com/documents/CHARTstyleguide_20170505.pdf

**Teaches.** A short title that makes a point. Horizontal gridlines only. The value axis on the side where the
reader looks. Labels on the data, not in a legend. Few colours.

**Adopt.** Gridlines in the hairline colour. An ink zero line. Values printed at bar ends. Line series named at
their right end. Legends only for stacked areas and heatmaps.
**Reject.** The red tag above the chart: our accent is the 1 px ink rule.

### Edward Tufte
- *The Visual Display of Quantitative Information* (2nd ed., 2001). *Beautiful Evidence* (2006), chapter on
  sparklines. Summary: https://en.wikipedia.org/wiki/Edward_Tufte , https://en.wikipedia.org/wiki/Sparkline

**Teaches.** Data-ink ratio: spend ink on data. Avoid chartjunk. Small multiples. The sparkline: a "small,
intense, word-sized graphic" in the line of text.

**Adopt.** No chart borders, backgrounds, 3D or shadows. Sparklines that sit in a sentence or a table cell, with
the last point marked and the value printed next to them. Tables before charts when there are few numbers.
**Reject.** Range frames and other minimalism that hides the zero line. We always draw zero.

### Cleveland, banking to 45°
- W. S. Cleveland, M. E. McGill and R. McGill, "The Shape Parameter of a Two-Variable Graph", *JASA* 83 (1988):
  https://www.jstor.org/stable/2288843
- J. Heer and M. Agrawala, "Multi-Scale Banking to 45 Degrees" (2006): https://idl.cs.washington.edu/papers/banking

**Teaches.** Slopes are judged best near 45°. Choose the aspect ratio so that the median absolute slope of the
line segments is 45°.

**Adopt, as an option only.** `bankTo45()` in `charts/core.ts`, with the median-absolute-slope method
(docs/math.md), clamped to 1/φ³ to 1/φ. **Corrected by later work** (see "Evidence" below): 45° is optimal only for
two segments, and measured slope errors are not lowest at 45°. We do not force it, and we add arc-length banking.

### ColorBrewer and Datawrapper on colour blindness
- https://colorbrewer2.org/
- https://blog.datawrapper.de/colorblindness-part2/

**Teaches.** Sequential scales vary in lightness. Diverging scales have two hues around a light midpoint. Red and
green are confused by about 1 man in 12. Make the two sides differ in lightness, or add a second cue.

**Adopt.** A single-hue green sequential scale. A red-to-green diverging scale through paper, with the side always
shown by position or a printed sign. A deliberate lightness gap between "up" green (L 0.34) and "down" red
(L 0.50). See docs/colour.md for the measurements.

## Colour science and accessibility

- Björn Ottosson, "A perceptual color space for image processing" (OKLab, 2020): https://bottosson.github.io/posts/oklab/
  **Adopt:** all colour maths in OKLab/OKLCH (`scripts/lib/color.ts`).
- W3C, CSS Color Module Level 4 (oklch(), gamut mapping): https://www.w3.org/TR/css-color-4/
  **Adopt:** reduce chroma, keep lightness and hue, to bring a colour into sRGB. We output hex for wide support.
- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/ . **Adopt as the gate:** 1.4.1 (colour not the only means), 1.4.3
  (4.5:1 text), 1.4.10 (reflow at 320 px), 1.4.11 (3:1 graphics and control borders), 2.4.13 focus appearance,
  2.5.8 target size (24 × 24 CSS px, AA, gated on every page; our 44 px controls follow 2.5.5, AAA).
- APCA (Accessible Perceptual Contrast Algorithm), apca-w3: https://github.com/Myndex/apca-w3 . **Adopt as a
  record, not a gate.** WCAG 3 is still a draft. We report Lc for every pair and flag pairs under the target.
- Machado, Oliveira and Fernandes (2009), CVD simulation:
  https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html . **Adopt:** severity-1.0
  matrices for protanopia and deuteranopia as a gate in the build; tritanopia reported only (the model's tritan
  handling is weak).

## Typography and grids

### Robert Bringhurst, *The Elements of Typographic Style* (4th ed., 2012)
- https://en.wikipedia.org/wiki/The_Elements_of_Typographic_Style ; applied to the web: http://webtypography.net/

**Teaches.** A measure of 45 to 75 characters, 66 ideal, for a single column. Scales built from musical or
geometric ratios. Lining or old-style figures by context. Tabular figures in tables.

**Adopt as preference, not evidence.** A measure chosen by measured characters per line: 67 at 19 px
(docs/math.md). Measured reading speed does not support 45–75 as a speed rule (Dyson and Kipping 1998, below). We rejected the golden
610 px column for text, because it gives 84 characters. Lining tabular figures everywhere data appears.
**Reject.** Old-style figures in running text. Our text is full of numbers that must line up with the tables.

### Matthew Butterick, *Practical Typography*, line length
- https://practicaltypography.com/line-length.html

**Teaches.** 45 to 90 characters, set by width, not by font size. A larger size makes fewer characters fit.
**Adopt.** The sans notes measure (567 px, about 76 characters at 15 px).

### Josef Müller-Brockmann, *Grid Systems in Graphic Design* (1981)
- https://en.wikipedia.org/wiki/Josef_M%C3%BCller-Brockmann

**Teaches.** A grid of columns and gutters, derived from the format, gives order and lets text, tables and images
share edges.

**Adopt.** 12 columns of 63 px with 21 px gutters exactly fill the 987 px page. The build checks that the column
width is a whole pixel. Text, tables and charts start on column edges.

### Modular scales
- Tim Brown, "More Meaningful Typography", A List Apart (2011): https://alistapart.com/article/more-meaningful-typography/

**Teaches.** Derive sizes from one ratio and one or two anchors, so sizes relate.
**Adopt.** The display scale is 13 × √φᵏ. **Reject** a single ratio for every size: φ is too steep for small text
(docs/math.md).

## Fonts and tooling

- EB Garamond on Fontsource (self-hosted, SIL OFL): https://fontsource.org/fonts/eb-garamond
- AGENTS.md convention for agent instruction files: https://agents.md/

## Evidence (peer-reviewed studies and standards behind the gated rules)

`docs/evidence.md` maps every rule to its basis. The sources, as checked for the evidence review of 17 Nov 2026:

- M. C. Dyson and G. J. Kipping, "The effects of line length and method of movement on patterns of reading from
  screen", *Visible Language* 32(2), 1998: https://journals.uc.edu/index.php/vl/article/view/5671
- L. Rello, M. Pielot and M.-C. Marcos, "Make It Big! The Effect of Font Size and Line Spacing on Online
  Readability", CHI 2016: https://researchr.org/publication/RelloPM16
- W. S. Cleveland and R. McGill, "Graphical Perception", *JASA* 79, 1984; J. Heer and M. Bostock,
  "Crowdsourcing Graphical Perception", CHI 2010: https://homes.cs.washington.edu/~jheer/files/2010-MTurk-CHI.pdf
- J. Talbot, V. Setlur and A. Anand, "Four Experiments on the Perception of Bar Charts", IEEE TVCG 20(12), 2014:
  https://datavis.cs.columbia.edu/files/papers/talbot%20-%204%20experiments.pdf
- J. Heer and M. Agrawala, "Multi-Scale Banking to 45 Degrees", IEEE TVCG 2006:
  https://homes.cs.washington.edu/~jheer/files/2006-Banking-InfoVis.pdf
- J. Talbot, J. Gerth and P. Hanrahan, "Arc Length-Based Aspect Ratio Selection", InfoVis 2011:
  https://tableau.com/sites/default/files/2023-01/infovis2011-talbot-arclengthbanking.pdf
- J. Talbot, J. Gerth and P. Hanrahan, "An Empirical Model of Slope Ratio Comparisons", InfoVis 2012:
  https://tableau.com/sites/default/files/2023-01/infovis2012-talbot-modelratiocomparisons.pdf
- G. M. Machado, M. M. Oliveira and L. A. F. Fernandes, "A Physiologically-based Model for Simulation of Color
  Vision Deficiency", IEEE TVCG 15(6), 2009 (above).
- Google, "Cumulative Layout Shift (CLS)": https://web.dev/articles/cls (a measurement standard; the 0.1 and 0.25
  limits are Google's choice, not a perceptual threshold).
- W3C, CSS Fonts Level 4 (font-display, sections 3.2 and 4.9) and Level 5 (size-adjust and the metric overrides,
  sections 4.4 and 4.5), Working Drafts: https://www.w3.org/TR/css-fonts-4/ , https://www.w3.org/TR/css-fonts-5/
- W3C, CSS Scroll Anchoring (Editor's Draft): https://drafts.csswg.org/css-scroll-anchoring/ . It adjusts scroll
  position; it does not prevent layout shifts, so we do not rely on it.
