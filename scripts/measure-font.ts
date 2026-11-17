/*
 * Measures EB Garamond from the self-hosted woff2 (default instance, weight 400) and the local fallback serif
 * (Times New Roman, or the metric-compatible Liberation Serif), and writes:
 *
 *   tokens/metrics.json             units per em, x-height, cap height, vertical metrics, the average advance of
 *                                   English text (letters weighted by frequency, plus spaces and punctuation),
 *                                   characters per line, and the fallback overrides computed from both fonts
 *   packages/design/css/fonts.css   the EB Garamond faces with font-display: optional (no swap after first
 *                                   paint, so no layout shift), and the metric-matched fallback face
 *
 *   node scripts/measure-font.ts           write both files
 *   node scripts/measure-font.ts --check   fail if a file is out of date
 *
 * The fallback overrides follow CSS Fonts 5 (W3C Working Draft), sections 4.4 and 4.5: size-adjust scales the
 * glyphs and every metric, including ascent-override, descent-override and line-gap-override; each override is
 * a percentage of the font size after adjustment. So:
 *   size-adjust       = average advance of EB Garamond / average advance of the fallback (same text mix)
 *   ascent-override   = EB Garamond ascent / unitsPerEm / size-adjust   (descent and line gap the same way)
 * The vertical metrics are the hhea values, which Chrome uses on macOS and Linux when OS/2 fsSelection bit 7
 * (USE_TYPO_METRICS) is off; the script reads the bit and uses the typo values when it is on.
 * If the fallback font is not installed (a CI machine), the script keeps the measurement already in
 * tokens/metrics.json.
 *
 * WOFF2 format: https://www.w3.org/TR/WOFF2/ . OpenType tables (head, hhea, hmtx, cmap, OS/2):
 * https://learn.microsoft.com/en-us/typography/opentype/spec/
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliDecompressSync } from "node:zlib";
import { compute, loadRaw } from "./lib/tokens.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const r4 = (v: number) => Math.round(v * 10000) / 10000;
const require = createRequire(join(root, "packages/design/package.json"));
const fontPath = join(dirname(require.resolve("@fontsource-variable/eb-garamond/package.json")), "files/eb-garamond-latin-wght-normal.woff2");

const KNOWN = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];

function readWoff2(buf: Buffer): Map<string, Buffer> {
  if (buf.toString("latin1", 0, 4) !== "wOF2") throw new Error("not a woff2 file");
  const numTables = buf.readUInt16BE(12);
  let p = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = buf[p++];
      v = v * 128 + (b & 127);
      if (!(b & 128)) return v;
    }
    throw new Error("bad UIntBase128");
  };
  const dir: { tag: string; len: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[p++];
    const tag = (flags & 63) === 63 ? buf.toString("latin1", p, (p += 4)) : KNOWN[flags & 63];
    const version = (flags >> 6) & 3;
    const orig = base128();
    const transformed = tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    const len = transformed ? base128() : orig;
    dir.push({ tag, len });
  }
  const compressed = buf.readUInt32BE(20);
  const data = brotliDecompressSync(buf.subarray(p, p + compressed));
  const out = new Map<string, Buffer>();
  let off = 0;
  for (const t of dir) {
    out.set(t.tag, data.subarray(off, off + t.len));
    off += t.len;
  }
  return out;
}

function cmapLookup(cmap: Buffer): (cp: number) => number {
  const n = cmap.readUInt16BE(2);
  for (let i = 0; i < n; i++) {
    const off = cmap.readUInt32BE(4 + i * 8 + 4);
    const format = cmap.readUInt16BE(off);
    if (format === 4) {
      const segX2 = cmap.readUInt16BE(off + 6);
      const ends = off + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
      return (cp) => {
        for (let s = 0; s < segX2 / 2; s++) {
          if (cmap.readUInt16BE(ends + s * 2) < cp) continue;
          const start = cmap.readUInt16BE(starts + s * 2);
          if (start > cp) return 0;
          const delta = cmap.readInt16BE(deltas + s * 2), ro = cmap.readUInt16BE(ranges + s * 2);
          if (ro === 0) return (cp + delta) & 0xffff;
          const g = cmap.readUInt16BE(ranges + s * 2 + ro + (cp - start) * 2);
          return g ? (g + delta) & 0xffff : 0;
        }
        return 0;
      };
    }
  }
  throw new Error("no cmap format 4 subtable");
}

/** Tables of a plain TrueType/OpenType file (the fallback serif). */
function readSfnt(buf: Buffer): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  for (let i = 0; i < buf.readUInt16BE(4); i++) {
    const o = 12 + i * 16, off = buf.readUInt32BE(o + 8);
    out.set(buf.toString("latin1", o, o + 4), buf.subarray(off, off + buf.readUInt32BE(o + 12)));
  }
  return out;
}

type Face = { upm: number; advance: (ch: string) => number; vertical: { ascent: number; descent: number; lineGap: number; table: string }; os2: Buffer };

function face(t: Map<string, Buffer>): Face {
  const head = t.get("head")!, hhea = t.get("hhea")!, hmtx = t.get("hmtx")!, os2 = t.get("OS/2")!;
  const upm = head.readUInt16BE(18);
  const nHMetrics = hhea.readUInt16BE(34);
  const glyph = cmapLookup(t.get("cmap")!);
  const useTypo = (os2.readUInt16BE(62) & 128) !== 0;
  const vertical = useTypo
    ? { ascent: os2.readInt16BE(68) / upm, descent: -os2.readInt16BE(70) / upm, lineGap: os2.readInt16BE(72) / upm, table: "OS/2 typo (USE_TYPO_METRICS)" }
    : { ascent: hhea.readInt16BE(4) / upm, descent: -hhea.readInt16BE(6) / upm, lineGap: hhea.readInt16BE(8) / upm, table: "hhea" };
  const advance = (ch: string) => {
    const g = glyph(ch.codePointAt(0)!);
    return hmtx.readUInt16BE(Math.min(g, nHMetrics - 1) * 4) / upm;
  };
  return { upm, advance, vertical, os2 };
}

const ebg = face(readWoff2(readFileSync(fontPath)));
const { upm, advance, os2 } = ebg;

// English letter frequencies (percent of letters), Lewand, "Cryptological Mathematics" (2000), table 1.1.
const freq: Record<string, number> = {
  e: 12.702, t: 9.056, a: 8.167, o: 7.507, i: 6.966, n: 6.749, s: 6.327, h: 6.094, r: 5.987, d: 4.253, l: 4.025,
  c: 2.782, u: 2.758, m: 2.406, w: 2.36, f: 2.228, g: 2.015, y: 1.974, p: 1.929, b: 1.492, v: 0.978, k: 0.772,
  j: 0.153, x: 0.15, q: 0.095, z: 0.074,
};
// Running English: about 1 space per 5.5 characters; 2% capitals, 2% digits, 2.5% punctuation (an estimate for
// our reports, stated in docs/math.md).
const mix = { letters: 0.755, space: 0.18, caps: 0.02, digits: 0.02, punct: 0.025 };
function advances(adv: (ch: string) => number) {
  const letters = Object.entries(freq).reduce((s, [c, f]) => s + f * adv(c), 0) / 100;
  const caps = "TSAMCBPDRHWFLINGEOKJUVYQXZ".split("").reduce((s, c) => s + adv(c), 0) / 26;
  const digits = "0123456789".split("").reduce((s, c) => s + adv(c), 0) / 10;
  const punct = ".,;:’()–".split("").reduce((s, c) => s + adv(c), 0) / 8;
  const space = adv(" ");
  return { letters, caps, digits, punct, space, avg: letters * mix.letters + space * mix.space + caps * mix.caps + digits * mix.digits + punct * mix.punct };
}
const { letters, caps, digits, punct, space, avg } = advances(advance);

/* ---------- The fallback serif ---------- */

const target = join(root, "tokens/metrics.json");
const old = existsSync(target) ? (JSON.parse(readFileSync(target, "utf8")) as { fallback?: Fallback }) : {};
type Fallback = { font: string; avgAdvanceEm: number; ascent: number; descent: number; lineGap: number; table: string };
const FALLBACK_FILES = [
  ["Times New Roman", "/System/Library/Fonts/Supplemental/Times New Roman.ttf"],
  ["Times New Roman", "C:/Windows/Fonts/times.ttf"],
  ["Times New Roman", "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf"],
  ["Liberation Serif (metric-compatible with Times New Roman)", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"],
] as const;
const found = FALLBACK_FILES.find(([, p]) => existsSync(p));
let fallback: Fallback;
if (found) {
  const f = face(readSfnt(readFileSync(found[1])));
  fallback = { font: found[0], avgAdvanceEm: r4(advances(f.advance).avg), ascent: r4(f.vertical.ascent), descent: r4(f.vertical.descent), lineGap: r4(f.vertical.lineGap), table: f.vertical.table };
} else if (old.fallback) {
  fallback = old.fallback;
} else {
  throw new Error("no fallback serif installed and no earlier measurement in tokens/metrics.json");
}
const sizeAdjust = avg / fallback.avgAdvanceEm;
const pctOf = (v: number) => `${(Math.round(v * 10000) / 100).toFixed(2)}%`;
const overrides = {
  "size-adjust": pctOf(sizeAdjust),
  "ascent-override": pctOf(ebg.vertical.ascent / sizeAdjust),
  "descent-override": pctOf(ebg.vertical.descent / sizeAdjust),
  "line-gap-override": pctOf(ebg.vertical.lineGap / sizeAdjust),
};

const k = compute(loadRaw(root));
const read = k.text.read.px, lg = k.text.lg.px, sm = k.text.sm.px;
const measure = k.layout.measure.px, wide = k.layout["measure-wide"].px, golden = k.layout.golden.px;
// System sans differs per platform; 0.5 em is a typical running-text advance for SF, Segoe UI and Roboto (estimate).
const sansAvg = 0.5;
const metrics = {
  source: "@fontsource-variable/eb-garamond, files/eb-garamond-latin-wght-normal.woff2 (default instance, weight 400)",
  unitsPerEm: upm,
  xHeight: r3(os2.readInt16BE(86) / upm),
  capHeight: r3(os2.readInt16BE(88) / upm),
  advanceEm: { letters: r3(letters), space: r3(space), capitals: r3(caps), digits: r3(digits), punctuation: r3(punct), runningText: r3(avg) },
  mix,
  charsPerLine: {
    [`read ${read}px in measure ${measure}px`]: Math.round(measure / (avg * read)),
    [`lg ${lg}px in measure ${measure}px`]: Math.round(measure / (avg * lg)),
    [`read ${read}px in golden ${golden}px (rejected)`]: Math.round(golden / (avg * read)),
    [`sans sm ${sm}px in ${wide}px (estimate, 0.5 em)`]: Math.round(wide / (sansAvg * sm)),
  },
  lineHeightPx: { read: Math.round(read * 1.55 * 100) / 100 },
  vertical: { ascent: r4(ebg.vertical.ascent), descent: r4(ebg.vertical.descent), lineGap: r4(ebg.vertical.lineGap), table: ebg.vertical.table },
  fallback,
  fallbackOverrides: overrides,
};

/* ---------- fonts.css ---------- */

const pkgDir = dirname(fontPath).replace(/\/files$/, "");
const LATIN = "eb-garamond-latin-wght-normal";
const all = ["wght.css", "wght-italic.css"].map((f) => readFileSync(join(pkgDir, f), "utf8")).join("\n");
const blocks = [...all.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[\s\S]*?\})/g)];
const latin = blocks.find((b) => b[1] === LATIN);
if (!latin) throw new Error(`fontsource CSS has no ${LATIN} face`);
// The latin upright face is embedded, so it is ready at the first layout: no font request, no swap, no shift.
const dataUrl = `data:font/woff2;base64,${readFileSync(fontPath).toString("base64")}`;
const fontDataTs = `// Generated by scripts/measure-font.ts. Do not edit.
/** EB Garamond latin upright (SIL OFL 1.1) as a data URL: the same string as font-embed.css, so a preload of it
 *  is the font the page uses. <FontPreload /> renders the preload. */
export const ebGaramondLatin = "${dataUrl}";
`;
const embedCss = `/* Generated by scripts/measure-font.ts from @fontsource-variable/eb-garamond (SIL OFL 1.1). Do not edit.
   EB Garamond, latin upright, embedded as a data URL: the face is ready at the first layout, so text never swaps
   fonts and never moves (docs/evidence.md, layout stability), provided the page also preloads the same data URL
   (<FontPreload /> in React; the single-file kit has the <link> in its head). Without the preload Chrome may
   paint one frame with the fallback first. Other scripts and the italic load on demand. */
${latin[2]
  .replace(/src: url\([^)]*\)/, `src: url(${dataUrl})`)
  .replace("font-display: swap;", "font-display: block;")}
`;
const rest = blocks
  .filter((b) => b[1] !== LATIN)
  .map((b) => `/* ${b[1]} */\n${b[2]}`)
  .join("\n\n")
  .replace(/url\(\.\/files\//g, "url(@fontsource-variable/eb-garamond/files/")
  .replace(/font-display: swap;/g, "font-display: optional;");
const fontsCss = `/* Generated by scripts/measure-font.ts from @fontsource-variable/eb-garamond. Do not edit.
   EB Garamond, self-hosted (no network at build or run time). The family registers as "EB Garamond Variable";
   --kc-serif lists it after "EB Garamond" and before "EB Garamond Fallback" (tokens.css).
   The latin upright face is embedded (font-embed.css). The other faces use font-display: optional: when one is
   not ready within the block period, this view keeps the measured fallback and never swaps, so text does not
   move; the next view has it from the cache. The url() paths are package paths; Next resolves them. */
@import "./font-embed.css";

${rest}
`;

const out = JSON.stringify(metrics, null, 2) + "\n";
const fontsPath = join(root, "packages/design/css/fonts.css");
const embedPath = join(root, "packages/design/css/font-embed.css");
const dataPath = join(root, "packages/design/src/font-data.ts");
if (process.argv.includes("--check")) {
  let stale = false;
  for (const [p, c] of [[target, out], [fontsPath, fontsCss], [embedPath, embedCss], [dataPath, fontDataTs]]) {
    if (!existsSync(p) || readFileSync(p, "utf8") !== c) {
      console.error(`out of date: ${p.slice(root.length + 1)} (run npm run tokens)`);
      stale = true;
    }
  }
  if (stale) process.exit(1);
} else {
  writeFileSync(target, out);
  writeFileSync(fontsPath, fontsCss);
  writeFileSync(embedPath, embedCss);
  writeFileSync(dataPath, fontDataTs);
}
console.log(out);
