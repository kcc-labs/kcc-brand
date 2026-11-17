/*
 * Builds the KC&C and mero logos from EB Garamond outlines (brand/src/glyphs.json) on the token grid, in every
 * colour variant, plus the TypeScript module the React <Logo> renders. Construction is documented in
 * brand/README.md; every measure here is a Fibonacci number or a phi ratio of one.
 *
 *   node scripts/build-brand.ts           write brand/logos/*.svg and packages/design/src/brand.ts
 *   node scripts/build-brand.ts --check   fail if they are out of date
 *
 * Icons (PNG, ICO) and the OG sample are rendered by scripts/render-icons.ts (needs Chrome).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compute, loadRaw } from "./lib/tokens.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const font = JSON.parse(readFileSync(join(root, "brand/src/glyphs.json"), "utf8")) as {
  unitsPerEm: number; capHeight: number; xHeight: number; glyphs: Record<string, { advance: number; path: string }>;
};
const k = compute(loadRaw(root));
const PHI = (1 + Math.sqrt(5)) / 2;

const COLORS = {
  ink: k.color.ink.light.hex,
  paper: k.color.paper.light.hex,
  green: k.ramps.green["800"].hex,
  darkPaper: k.color.paper.dark.hex,
};

/* ---------- Setting outlines ---------- */

type Box = { x0: number; y0: number; x1: number; y1: number };
type Set = { d: string; box: Box; width: number };
const f1 = (v: number) => Math.round(v * 100) / 100;

/** Transforms a font-unit path (y up) to logo units (y down) at scale s, origin (ox, baseline). */
function place(path: string, s: number, ox: number, base: number, box: Box): string {
  return path.replace(/([MLQ])([^MLQZ]+)/g, (_, cmd: string, nums: string) => {
    const v = nums.trim().split(/[\s,]+/).map(Number);
    const out: string[] = [];
    for (let i = 0; i < v.length; i += 2) {
      const x = ox + v[i] * s, y = base - v[i + 1] * s;
      box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x); box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y);
      out.push(`${f1(x)} ${f1(y)}`);
    }
    return cmd + out.join(" ");
  });
}

/**
 * Sets `text` with letter height `h` (cap height, or x-height when `by` is "x"), tracking in em, from x = ox on
 * baseline `base`. Kerning pairs are in em and were set by eye on the grid (README).
 */
function setText(text: string, h: number, opts: { ox?: number; base?: number; tracking?: number; by?: "cap" | "x"; kern?: Record<string, number> } = {}): Set {
  const s = h / (opts.by === "x" ? font.xHeight : font.capHeight);
  const em = font.unitsPerEm * s;
  let x = opts.ox ?? 0;
  const box: Box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  let d = "";
  [...text].forEach((ch, i) => {
    const g = font.glyphs[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    d += place(g.path, s, x, opts.base ?? 0, box);
    x += g.advance * s;
    if (i < text.length - 1) x += ((opts.tracking ?? 0) + (opts.kern?.[ch + text[i + 1]] ?? 0)) * em;
  });
  return { d, box, width: x - (opts.ox ?? 0) };
}

/** Moves a set so its outline box starts at (x, y). */
function shift(set: Set, x: number, y: number): Set {
  const dx = x - set.box.x0, dy = y - set.box.y0;
  const d = set.d.replace(/([MLQ])([^MLQZ]+)/g, (_, c: string, n: string) => {
    const v = n.trim().split(/[\s,]+/).map(Number);
    return c + v.map((u, i) => f1(u + (i % 2 ? dy : dx))).join(" ");
  });
  const w = set.box.x1 - set.box.x0, h = set.box.y1 - set.box.y0;
  return { d, width: set.width, box: { x0: x, y0: y, x1: x + w, y1: y + h } };
}

const rect = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}H${f1(x + w)}V${f1(y + h)}H${f1(x)}Z`;
/** A square ring (frame) of width t: outer square plus inner square, filled even-odd. */
const ring = (x: number, y: number, side: number, t: number) => rect(x, y, side, side) + rect(x + t, y + t, side - 2 * t, side - 2 * t);

/* ---------- The marks (logo units; 1 unit = 1 px at reference size) ---------- */

const KERN = { KC: -0.02, "C&": -0.01, "&C": -0.01 };
const CAP = 34; // F(9)
const SIDE = 89; // F(11) = CAP x phi^2

type Art = { w: number; h: number; layers: { d: string; role: "fg" | "mark" | "knock" }[]; label: string };

function wordmarkKcc(): Art {
  const t = setText("KC&C", CAP, { tracking: 0.04, kern: KERN });
  const s = shift(t, 0, 0);
  return { w: f1(s.box.x1), h: f1(s.box.y1), layers: [{ d: s.d, role: "fg" }], label: "KC&C" };
}

function lockupKcc(): Art {
  const word = shift(setText("KC&C", CAP, { tracking: 0.04, kern: KERN }), 0, 0);
  const W = word.box.x1;
  const capH = word.box.y1; // includes the ampersand's height
  const ruleY = capH + 13; // s3
  const descCap = CAP / PHI ** 3; // 8.03: three golden steps down
  const raw = setText("CREDIT & COLLATERAL", descCap, { tracking: 0.12 });
  const rw = raw.box.x1 - raw.box.x0;
  const desc = shift(raw, Math.max(0, (W - rw) / 2), ruleY + 1 + 13);
  const total = Math.max(W, rw);
  const wordC = shift(word, (total - W) / 2, 0);
  return {
    w: f1(total), h: f1(desc.box.y1),
    layers: [{ d: wordC.d + rect(0, ruleY, total, 1) + desc.d, role: "fg" }],
    label: "KC&C, Credit & Collateral",
  };
}

/** Framed monogram for documents: 2-unit frame, 1-unit inner rule at inset 5, "KC" at cap 34, centred. */
function monogramKcc(): Art {
  const kc = setText("KC", CAP, { tracking: 0.02, kern: KERN });
  const w = kc.box.x1 - kc.box.x0, h = kc.box.y1 - kc.box.y0;
  const letters = shift(kc, (SIDE - w) / 2, (SIDE - h) / 2);
  return { w: SIDE, h: SIDE, layers: [{ d: ring(0, 0, SIDE, 2) + ring(5, 5, SIDE - 10, 1) + letters.d, role: "fg" }], label: "KC&C monogram" };
}

/** Solid square with "KC" knocked out: app icon and favicon. */
function iconKcc(): Art {
  const kc = setText("KC", CAP, { tracking: 0.02, kern: KERN });
  const w = kc.box.x1 - kc.box.x0, h = kc.box.y1 - kc.box.y0;
  const letters = shift(kc, (SIDE - w) / 2, (SIDE - h) / 2);
  return { w: SIDE, h: SIDE, layers: [{ d: rect(0, 0, SIDE, SIDE), role: "mark" }, { d: letters.d, role: "knock" }], label: "KC&C" };
}

const MERO_X = 21; // x-height of the mero wordmark: F(8)

function wordmarkMero(): Art {
  const t = shift(setText("mero", MERO_X, { by: "x", tracking: 0.01 }), 0, 0);
  return { w: f1(t.box.x1), h: f1(t.box.y1), layers: [{ d: t.d, role: "fg" }], label: "mero" };
}

/** The mero mark: a square of 89 with "m" knocked out at x-height 34 (89 / phi^2). */
function markMero(side = SIDE): Art {
  const m = setText("m", side / PHI ** 2, { by: "x" });
  const w = m.box.x1 - m.box.x0, h = m.box.y1 - m.box.y0;
  const letter = shift(m, (side - w) / 2, (side - h) / 2);
  return { w: side, h: side, layers: [{ d: rect(0, 0, side, side), role: "mark" }, { d: letter.d, role: "knock" }], label: "mero" };
}

/** Mark (55) beside the wordmark; the wordmark's x-height band is centred on the mark; gap 13. */
function lockupMero(): Art {
  const side = 55;
  const mark = markMero(side);
  const word = setText("mero", MERO_X, { by: "x", tracking: 0.01 });
  const xTop = (side - MERO_X) / 2; // x-height band top
  // place so the x-height top sits at xTop: baseline = xTop + MERO_X
  const placed = setText("mero", MERO_X, { by: "x", tracking: 0.01, ox: side + 13 - (word.box.x0 - 0), base: xTop + MERO_X });
  return {
    w: f1(placed.box.x1), h: side,
    layers: [mark.layers[0], mark.layers[1], { d: placed.d, role: "fg" }],
    label: "mero",
  };
}

const ARTS: Record<string, Art> = {
  "kcc-wordmark": wordmarkKcc(),
  "kcc-lockup": lockupKcc(),
  "kcc-monogram": monogramKcc(),
  "kcc-icon": iconKcc(),
  "mero-wordmark": wordmarkMero(),
  "mero-mark": markMero(),
  "mero-lockup": lockupMero(),
};

/* ---------- Variants ---------- */

type Variant = "primary" | "ink" | "reversed-green" | "reversed-dark";
const VARIANTS: Record<Variant, { fg: string; mark: (name: string) => string; use: string; bg: string }> = {
  primary: { fg: COLORS.ink, mark: (n) => (n.startsWith("mero") ? COLORS.green : COLORS.ink), use: "On paper. The default.", bg: COLORS.paper },
  ink: { fg: COLORS.ink, mark: () => COLORS.ink, use: "One colour: fax-like reproduction, stamps, embossing, single-colour print.", bg: COLORS.paper },
  "reversed-green": { fg: COLORS.paper, mark: () => COLORS.paper, use: "Paper on the heavy dark green.", bg: COLORS.green },
  "reversed-dark": { fg: COLORS.paper, mark: () => COLORS.paper, use: "Paper on dark paper (dark theme).", bg: COLORS.darkPaper },
};

/** One SVG. Marks are one even-odd path, so the knocked-out letter shows whatever is behind the logo. */
function svg(name: string, art: Art, v: Variant, opts: { background?: boolean; size?: number } = {}): string {
  const vv = VARIANTS[v];
  const markD = art.layers.filter((l) => l.role !== "fg").map((l) => l.d).join("");
  const fgD = art.layers.filter((l) => l.role === "fg").map((l) => l.d).join("");
  const parts = [
    opts.background ? `<rect width="${art.w}" height="${art.h}" fill="${vv.bg}"/>` : "",
    markD ? `<path fill="${vv.mark(name)}" fill-rule="evenodd" d="${markD}"/>` : "",
    fgD ? `<path fill="${vv.fg}" fill-rule="evenodd" d="${fgD}"/>` : "",
  ].join("");
  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : ` width="${art.w}" height="${art.h}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.w} ${art.h}"${size} role="img" aria-label="${art.label.replace(/&/g, "&amp;")}"><title>${art.label.replace(/&/g, "&amp;")}</title>${parts}</svg>\n`;
}

/* ---------- Write ---------- */

const files: [string, string][] = [];
for (const [name, art] of Object.entries(ARTS))
  for (const v of Object.keys(VARIANTS) as Variant[]) {
    files.push([`brand/logos/${name}-${v}.svg`, svg(name, art, v)]);
  }

// Icon sources for the renderer: full-bleed squares with their own background, and maskable versions with the
// artwork inside the central 80% safe zone (W3C manifest "maskable" purpose).
const iconSrc = (name: "kcc-icon" | "mero-mark", maskable: boolean) => {
  const art = ARTS[name];
  const vv = VARIANTS.primary;
  const bg = name === "kcc-icon" ? COLORS.ink : COLORS.green;
  const knock = art.layers.find((l) => l.role === "knock")!.d;
  if (!maskable) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.w} ${art.h}" width="100%" height="100%"><rect width="${art.w}" height="${art.h}" fill="${bg}"/><path fill="${vv.bg}" d="${knock}"/></svg>\n`;
  const pad = art.w * 0.125; // artwork scaled to 80% of the canvas: 0.8 = 1 / (1 + 2 x 0.125)
  const W = art.w + 2 * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${W} ${W}" width="100%" height="100%"><rect x="${-pad}" y="${-pad}" width="${W}" height="${W}" fill="${bg}"/><path fill="${vv.bg}" d="${knock}"/></svg>\n`;
};
files.push(["brand/icons/kcc/favicon.svg", iconSrc("kcc-icon", false)]);
files.push(["brand/icons/kcc/maskable.svg", iconSrc("kcc-icon", true)]);
files.push(["brand/icons/mero/favicon.svg", iconSrc("mero-mark", false)]);
files.push(["brand/icons/mero/maskable.svg", iconSrc("mero-mark", true)]);
for (const b of ["kcc", "mero"])
  files.push([
    `brand/icons/${b}/site.webmanifest`,
    JSON.stringify(
      {
        name: b === "kcc" ? "KC&C" : "mero",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        theme_color: COLORS.paper,
        background_color: COLORS.paper,
        display: "standalone",
      },
      null,
      2,
    ) + "\n",
  ]);

// TypeScript data for <Logo>: the paths and sizes; colours come from CSS variables at render time.
const data = Object.fromEntries(
  Object.entries(ARTS).map(([n, a]) => [n, { w: a.w, h: a.h, label: a.label, mark: a.layers.filter((l) => l.role !== "fg").map((l) => l.d).join(""), fg: a.layers.filter((l) => l.role === "fg").map((l) => l.d).join("") }]),
);
files.push([
  "packages/design/src/brand-data.ts",
  `// Generated by scripts/build-brand.ts from brand/src/glyphs.json. Do not edit. Never redraw the logos by hand.\n\nexport const LOGOS = ${JSON.stringify(data, null, 2)} as const;\n\n/** Fixed brand colours for the fixed variants. */\nexport const BRAND_COLORS = ${JSON.stringify(COLORS, null, 2)} as const;\n\nexport type LogoName = keyof typeof LOGOS;\n`,
]);

let stale = 0;
for (const [rel, content] of files) {
  const p = join(root, rel);
  if (existsSync(p) && readFileSync(p, "utf8") === content) continue;
  if (check) {
    console.error(`out of date: ${rel} (run npm run brand)`);
    stale++;
  } else {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
}
if (stale) process.exit(1);
console.log(`brand ${check ? "checked" : "built"}: ${Object.keys(ARTS).length} logos x ${Object.keys(VARIANTS).length} variants`);
for (const [n, a] of Object.entries(ARTS)) console.log(`  ${n}: ${a.w} x ${a.h}`);
