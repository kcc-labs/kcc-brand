# KC&C and mero brand files

Use these files, or the `Logo` component from `@kcc/design`. Never redraw, retype or edit a logo. To change one,
change `scripts/build-brand.ts`, then run `npm run brand` and `node scripts/render-icons.ts`.

## Files

| Path | What |
|---|---|
| `logos/<logo>-<variant>.svg` | 7 logos × 4 variants, transparent background |
| `icons/kcc/`, `icons/mero/` | `favicon.svg`, `favicon.ico` (16, 32, 48), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `maskable-512.png`, `site.webmanifest` |
| `og/og-card.html`, `og/og-sample.png` | Social card template, 1200 × 630, and a rendered sample |
| `src/glyphs.json` | EB Garamond 500 outlines used by the logos (SIL Open Font License 1.1) |

Logos: `kcc-lockup` (wordmark, rule, "Credit & Collateral"), `kcc-wordmark`, `kcc-monogram` (framed, for
documents), `kcc-icon` (solid, for favicons and apps), `mero-lockup`, `mero-wordmark`, `mero-mark`.

Variants: `primary` (on paper; the mero mark in heavy green), `ink` (one colour), `reversed-green` (paper colour, for
the heavy green), `reversed-dark` (paper colour, for dark paper). The marks are one even-odd path, so the letter is
cut out and shows whatever is behind the logo.

## Construction (logo units; 1 unit = 1 px at reference size)

All measures come from the token grid: Fibonacci numbers and φ (1.618).

- **Letters:** EB Garamond Medium (500) outlines, not a font at run time, so the logo looks the same everywhere.
  Kerning: KC −0.02 em, C& and &C −0.01 em, set by eye.
- **KC&C wordmark:** cap height 34 (F9), tracking 0.04 em.
- **KC&C lockup:** the wordmark, a 1-unit rule 13 (s3) below it, and "CREDIT & COLLATERAL" 13 below the rule, at cap
  height 34 / φ³ = 8 with 0.12 em tracking. Both are centred on the wider of the two.
- **KC&C monogram:** square 89 (F11). Frame 2 (the legal-box weight), inner rule 1 at inset 5 (s1). "KC" at cap
  height 34, centred. 89 / 34 = 2.618 = φ².
- **KC&C icon:** square 89 filled with "KC" cut out at cap height 34.
- **mero wordmark:** lowercase, x-height 21 (F8), tracking 0.01 em.
- **mero mark:** square 89 with "m" cut out at x-height 34 (89 / φ²).
- **mero lockup:** the mark at 55 (F10), a gap of 13, then the wordmark with its x-height band centred on the mark.
- **Maskable icons:** the artwork scaled to the central 80% of the canvas (W3C manifest safe zone).

## Clear space and minimum sizes

Clear space on every side: 21 units (s4) at reference size, scaled with the logo. Minimum sizes: lockup 55 px high
(18 mm), wordmark 13 px cap height, monogram 24 px, icon and mero mark 16 px, mero lockup 34 px high.

## Colours

Ink `#141414`, paper `#F3EFE4`, heavy green `green.800` (computed from OKLCH in `tokens/tokens.json`), dark paper
`paper` in the dark theme. No other colour is allowed for a logo.

## Do not

Stretch, rotate, recolour, add shadows, glows or gradients, put a mark in a circle or a coin, place a logo on a busy
or low-contrast background, or set the name in another font. The playground's Brand page shows each case.
