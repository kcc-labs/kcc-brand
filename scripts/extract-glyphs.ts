/*
 * Outlines the glyphs the logos need from a static EB Garamond WOFF (weight 500) and writes
 * brand/src/glyphs.json: per character, its advance and an SVG path in font units (y up, baseline 0).
 * Run once, when the logo letters change. The build (scripts/build-brand.ts) reads only the JSON, so it needs no
 * network and no font file.
 *
 *   node scripts/extract-glyphs.ts path/to/EBGaramond-500.woff
 *
 * Get the file from Google Fonts (EB Garamond, OFL 1.1): the css2 API serves WOFF to older browsers.
 * WOFF 1.0: https://www.w3.org/TR/WOFF/ . glyf/loca/cmap/hmtx: https://learn.microsoft.com/en-us/typography/opentype/spec/
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&·0123456789.,- ";

const buf = readFileSync(process.argv[2] ?? "");
if (buf.toString("latin1", 0, 4) !== "wOFF") throw new Error("not a WOFF 1.0 file");
const tables = new Map<string, Buffer>();
for (let i = 0, n = buf.readUInt16BE(12); i < n; i++) {
  const p = 44 + i * 20;
  const tag = buf.toString("latin1", p, p + 4);
  const off = buf.readUInt32BE(p + 4), comp = buf.readUInt32BE(p + 8), orig = buf.readUInt32BE(p + 12);
  const raw = buf.subarray(off, off + comp);
  tables.set(tag, comp < orig ? inflateSync(raw) : raw);
}
const head = tables.get("head")!, hhea = tables.get("hhea")!, hmtx = tables.get("hmtx")!, loca = tables.get("loca")!, glyf = tables.get("glyf")!, cmap = tables.get("cmap")!;
const os2 = tables.get("OS/2")!;
const upm = head.readUInt16BE(18), longLoca = head.readInt16BE(50) === 1, nH = hhea.readUInt16BE(34);

function glyphId(cp: number): number {
  for (let i = 0, n = cmap.readUInt16BE(2); i < n; i++) {
    const off = cmap.readUInt32BE(4 + i * 8 + 4);
    if (cmap.readUInt16BE(off) !== 4) continue;
    const seg2 = cmap.readUInt16BE(off + 6), ends = off + 14, starts = ends + seg2 + 2, deltas = starts + seg2, ranges = deltas + seg2;
    for (let s = 0; s < seg2 / 2; s++) {
      if (cmap.readUInt16BE(ends + s * 2) < cp) continue;
      const start = cmap.readUInt16BE(starts + s * 2);
      if (start > cp) return 0;
      const delta = cmap.readInt16BE(deltas + s * 2), ro = cmap.readUInt16BE(ranges + s * 2);
      if (!ro) return (cp + delta) & 0xffff;
      const g = cmap.readUInt16BE(ranges + s * 2 + ro + (cp - start) * 2);
      return g ? (g + delta) & 0xffff : 0;
    }
  }
  return 0;
}

const glyphRange = (g: number): [number, number] =>
  longLoca ? [loca.readUInt32BE(g * 4), loca.readUInt32BE(g * 4 + 4)] : [loca.readUInt16BE(g * 2) * 2, loca.readUInt16BE(g * 2 + 2) * 2];

type Pt = { x: number; y: number; on: boolean };

/** Contours of a glyph (composites resolved by offset; scaled components are not needed for these letters). */
function contours(g: number, dx = 0, dy = 0): Pt[][] {
  const [a, b] = glyphRange(g);
  if (a === b) return [];
  const d = glyf.subarray(a, b);
  const n = d.readInt16BE(0);
  if (n < 0) {
    const out: Pt[][] = [];
    let p = 10, more = true;
    while (more) {
      const flags = d.readUInt16BE(p), comp = d.readUInt16BE(p + 2);
      p += 4;
      const words = !!(flags & 1);
      const ox = words ? d.readInt16BE(p) : d.readInt8(p);
      const oy = words ? d.readInt16BE(p + 2) : d.readInt8(p + 1);
      p += words ? 4 : 2;
      if (flags & 8) p += 2;
      else if (flags & 0x40) p += 4;
      else if (flags & 0x80) p += 8;
      out.push(...contours(comp, dx + ox, dy + oy));
      more = !!(flags & 0x20);
    }
    return out;
  }
  const ends = Array.from({ length: n }, (_, i) => d.readUInt16BE(10 + i * 2));
  const count = ends[n - 1] + 1;
  let p = 10 + n * 2;
  p += 2 + d.readUInt16BE(p);
  const flags: number[] = [];
  while (flags.length < count) {
    const f = d[p++];
    flags.push(f);
    if (f & 8) for (let r = d[p++]; r > 0; r--) flags.push(f);
  }
  const read = (short: number, same: number) => {
    const out: number[] = [];
    let v = 0;
    for (const f of flags) {
      if (f & short) v += f & same ? d[p++] : -d[p++];
      else if (!(f & same)) {
        v += d.readInt16BE(p);
        p += 2;
      }
      out.push(v);
    }
    return out;
  };
  const xs = read(2, 16), ys = read(4, 32);
  const pts = flags.map((f, i) => ({ x: xs[i] + dx, y: ys[i] + dy, on: !!(f & 1) }));
  return ends.map((e, i) => pts.slice(i ? ends[i - 1] + 1 : 0, e + 1));
}

/** TrueType quadratic contours to an SVG path (y up, as in the font). */
function toPath(cs: Pt[][]): string {
  const f = (v: number) => Math.round(v * 10) / 10;
  return cs
    .map((c) => {
      if (!c.length) return "";
      const start = c[0].on ? c[0] : c[c.length - 1].on ? c[c.length - 1] : { x: (c[0].x + c[c.length - 1].x) / 2, y: (c[0].y + c[c.length - 1].y) / 2, on: true };
      let s = `M${f(start.x)} ${f(start.y)}`;
      const seq = c[0].on ? c.slice(1).concat([c[0]]) : c.concat([]);
      let ctrl: Pt | null = null;
      for (const pt of seq) {
        if (pt.on) {
          s += ctrl ? `Q${f(ctrl.x)} ${f(ctrl.y)} ${f(pt.x)} ${f(pt.y)}` : `L${f(pt.x)} ${f(pt.y)}`;
          ctrl = null;
        } else {
          if (ctrl) {
            const mx = (ctrl.x + pt.x) / 2, my = (ctrl.y + pt.y) / 2;
            s += `Q${f(ctrl.x)} ${f(ctrl.y)} ${f(mx)} ${f(my)}`;
          }
          ctrl = pt;
        }
      }
      if (ctrl) s += `Q${f(ctrl.x)} ${f(ctrl.y)} ${f(start.x)} ${f(start.y)}`;
      return s + "Z";
    })
    .join("");
}

const glyphs: Record<string, { advance: number; path: string }> = {};
for (const ch of CHARS) {
  const g = glyphId(ch.codePointAt(0)!);
  glyphs[ch] = { advance: hmtx.readUInt16BE(Math.min(g, nH - 1) * 4), path: toPath(contours(g)) };
}
const out = {
  source: "EB Garamond 500 (Georg Duffner, Octavio Pardo), SIL Open Font License 1.1, static instance from Google Fonts",
  unitsPerEm: upm,
  capHeight: os2.readInt16BE(88),
  xHeight: os2.readInt16BE(86),
  glyphs,
};
const target = join(root, "brand/src/glyphs.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(out) + "\n");
console.log(`wrote brand/src/glyphs.json: ${Object.keys(glyphs).length} glyphs, upm ${upm}, cap ${out.capHeight}, x ${out.xHeight}`);
