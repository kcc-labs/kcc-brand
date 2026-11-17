/*
 * Chart geometry: data in, a list of SVG primitives out, drawn to scale. No DOM, no React, no imports.
 * The React components map the primitives to elements; html/kcc-charts.js (built from this file) turns them into
 * an SVG string for single-file pages. Keep this file to type annotations only (no enums, no namespaces), so Node
 * can strip the types without a compiler.
 *
 * Class names on the primitives are styled in components.css: kc-c-label, kc-c-value, kc-c-tick, kc-c-grid,
 * kc-c-axis, kc-c-limit, kc-c-up, kc-c-down, kc-c-a, kc-c-b, kc-c-line(--2..4), kc-c-area, kc-c-dot.
 */

export type ChartNode =
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; c: string }
  | { t: "rect"; x: number; y: number; w: number; h: number; c: string; title?: string }
  | { t: "text"; x: number; y: number; s: string; c: string; a?: "start" | "middle" | "end" }
  | { t: "path"; d: string; c: string }
  | { t: "circle"; x: number; y: number; r: number; c: string };

/** A finished drawing: its viewBox size, an accessible label and the primitives. */
export type Drawing = { w: number; h: number; label: string; nodes: ChartNode[] };

export type Format = (v: number) => string;

/* ---------- Number formats (true minus sign, thousands separators) ---------- */

export const MINUS = "−";

const PHI_ = (1 + Math.sqrt(5)) / 2;

/* ---------- Floors (docs/evidence.md; the same values as tokens.json -> evidence.floors, checked by the build) ---------- */

/** A chart read for values has a value axis of at least 80 CSS px (Heer and Bostock 2010, experiment 3). */
export const MIN_VALUE_AXIS = 80;
/** Gridlines at least 8 CSS px apart (Heer and Bostock 2010: the authors' suggestion, not a tested threshold). */
export const MIN_GRID_GAP = 8;
/** The narrowest a chart is drawn before its wrapper scrolls (components.css: min-width of .kc-chart svg). */
export const MIN_CHART_WIDTH = 520;

/** Smallest on-screen scale of a drawing of width w: the SVG shrinks to min(w, 520) px before it scrolls. */
const minScale = (w: number) => Math.min(w, MIN_CHART_WIDTH) / w;

/** True when a formatted value shows zero ("0%", "0.0", "$0"): such a value has no side, so it gets no up/down colour. */
export const shownZero = (s: string): boolean => !/[1-9]/.test(s);

const sign = (v: number, s: string): string => (v < 0 ? MINUS + s : v > 0 ? "+" + s : s);

/** 1234.5 -> "1,234.5" with `d` decimals. */
export function num(v: number, d = 0): string {
  const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  return v < 0 && s !== (0).toFixed(d) ? MINUS + s : s;
}

/** Percent of a percent value: 12.34 -> "12.3%". */
export function pct(v: number, d = 1): string {
  return num(v, d) + "%";
}

/** Signed percent: 12 -> "+12%", -15 -> "−15%". Zero has no sign. */
export function signedPct(v: number, d = 0): string {
  const r = Number(v.toFixed(d));
  return sign(r, num(Math.abs(r), d) + "%");
}

/** Compact dollars: 1100000 -> "$1.10M", 99500 -> "$99.5k". */
export function usdCompact(v: number): string {
  const a = Math.abs(v);
  const body = a >= 1e9 ? (a / 1e9).toFixed(2) + "B" : a >= 1e6 ? (a / 1e6).toFixed(2) + "M" : a >= 1e3 ? (a / 1e3).toFixed(1) + "k" : a.toFixed(0);
  return (v < 0 ? MINUS : "") + "$" + body.replace(/\.0+([kMB])$/, "$1");
}

/* ---------- Scales ---------- */

/** Round tick values covering [min, max], about `count` of them (Heckbert's nice numbers). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!(isFinite(min) && isFinite(max))) return [0, 1];
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / Math.max(1, count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toPrecision(12)));
  return out;
}

/**
 * Nice ticks whose gaps stay at least MIN_GRID_GAP CSS px apart when `span` drawing units are shown at `scale`:
 * fewer ticks until the gap is wide enough.
 */
export function gridTicks(min: number, max: number, span: number, scale: number, count = 5): number[] {
  let t = niceTicks(min, max, count);
  for (let c = count - 1; c >= 2 && (span / Math.max(1, t.length - 1)) * scale < MIN_GRID_GAP; c--) t = niceTicks(min, max, c);
  return t;
}

const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

/** Width of 13 px system sans text, estimated (no DOM here). 0.6 em a character errs on the wide side for
 *  tabular digits, which are the widest common glyphs in our labels. */
export const textWidth = (s: string, px = 13): number => s.length * px * 0.6;

const r1 = (v: number) => Math.round(v * 10) / 10;

/* ---------- Centred-zero bars ---------- */

export type DivergingRow = { label: string; value: number; tone?: "up" | "down" | "neutral" };

export type DivergingOptions = {
  rows: DivergingRow[];
  /** Accessible name: what the chart shows, with unit and basis. */
  label: string;
  format?: Format;
  /** Which sign is good for the reader. Default "positive": positive bars are "up" (green). */
  better?: "positive" | "negative";
  width?: number;
  bar?: number;
  gap?: number;
  ticks?: number;
};

/** Horizontal bars from a zero line in the middle; labels left, values at the bar end. */
export function divergingBars(o: DivergingOptions): Drawing {
  const W = o.width ?? 720, bar = o.bar ?? 18, gap = o.gap ?? 12;
  const fmt = o.format ?? ((v: number) => signedPct(v));
  const maxAbs = Math.max(...o.rows.map((r) => Math.abs(r.value)), 1e-9);
  const labelW = Math.min(Math.max(...o.rows.map((r) => textWidth(r.label))), W * 0.42);
  const valueW = Math.max(...o.rows.map((r) => textWidth(fmt(r.value)))) + 8;
  const x0 = labelW + 13 + valueW, x1 = W - valueW;
  const ticks = gridTicks(-maxAbs, maxAbs, x1 - x0, minScale(W), o.ticks ?? 7);
  const ext = Math.max(Math.abs(ticks[0]), Math.abs(ticks[ticks.length - 1]));
  const x = linear(-ext, ext, x0, x1);
  const top = 8, H = top + o.rows.length * (bar + gap) - gap + 34;
  const plotBottom = H - 26;
  const nodes: ChartNode[] = [];
  for (const t of ticks) {
    const tx = r1(x(t));
    nodes.push({ t: "line", x1: tx, x2: tx, y1: top - 4, y2: plotBottom, c: t === 0 ? "kc-c-axis" : "kc-c-grid" });
    nodes.push({ t: "text", x: tx, y: H - 8, s: fmt(t), c: "kc-c-tick", a: "middle" });
  }
  o.rows.forEach((r, i) => {
    const y = top + i * (bar + gap);
    const base = r1(y + bar * 0.72);
    const good = o.better === "negative" ? r.value < 0 : r.value > 0;
    const tone = r.tone ?? (r.value === 0 || shownZero(fmt(r.value)) ? "neutral" : good ? "up" : "down");
    const xv = x(r.value), xz = x(0);
    const w = Math.max(1, Math.abs(xv - xz));
    const left = r.value < 0 ? xz - w : xz;
    nodes.push({ t: "text", x: r1(labelW), y: base, s: r.label, c: "kc-c-label", a: "end" });
    nodes.push({ t: "rect", x: r1(left), y, w: r1(w), h: bar, c: tone === "up" ? "kc-c-up" : tone === "down" ? "kc-c-down" : "kc-c-a", title: `${r.label}: ${fmt(r.value)}` });
    nodes.push(
      r.value < 0
        ? { t: "text", x: r1(left - 6), y: base, s: fmt(r.value), c: "kc-c-value", a: "end" }
        : { t: "text", x: r1(left + w + 6), y: base, s: fmt(r.value), c: "kc-c-value", a: "start" },
    );
  });
  return { w: W, h: H, label: o.label, nodes };
}

/* ---------- Paired bars ---------- */

export type PairedRow = { label: string; a: number; b: number };

export type PairedOptions = {
  rows: PairedRow[];
  label: string;
  /** Names of the two series, for the accessible label: [a, b]. a is drawn neutral, b in ink. */
  series: [string, string];
  format?: Format;
  width?: number;
  bar?: number;
  ticks?: number;
};

/** Two bars per row from a shared zero: a (the comparison, neutral) above b (the subject, ink). */
export function pairedBars(o: PairedOptions): Drawing {
  const W = o.width ?? 720, bar = o.bar ?? 13, inner = 2, gap = 15;
  const fmt = o.format ?? ((v: number) => num(v));
  const vals = o.rows.flatMap((r) => [r.a, r.b]);
  const labelW = Math.min(Math.max(...o.rows.map((r) => textWidth(r.label))), W * 0.38);
  const valueW = Math.max(...vals.map((v) => textWidth(fmt(v)))) + 8;
  const x0 = labelW + 13 + (Math.min(0, ...vals) < 0 ? valueW : 0), x1 = W - valueW;
  const ticks = gridTicks(Math.min(0, ...vals), Math.max(0, ...vals), x1 - x0, minScale(W), o.ticks ?? 5);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const x = linear(lo, hi, x0, x1);
  const rowH = bar * 2 + inner;
  const top = 8, H = top + o.rows.length * (rowH + gap) - gap + 34;
  const plotBottom = H - 26;
  const nodes: ChartNode[] = [];
  for (const t of ticks) {
    const tx = r1(x(t));
    nodes.push({ t: "line", x1: tx, x2: tx, y1: top - 4, y2: plotBottom, c: t === 0 ? "kc-c-axis" : "kc-c-grid" });
    nodes.push({ t: "text", x: tx, y: H - 8, s: fmt(t), c: "kc-c-tick", a: "middle" });
  }
  const xz = x(0);
  o.rows.forEach((r, i) => {
    const y = top + i * (rowH + gap);
    nodes.push({ t: "text", x: r1(labelW), y: r1(y + rowH / 2 + 4.5), s: r.label, c: "kc-c-label", a: "end" });
    ([["a", r.a, y], ["b", r.b, y + bar + inner]] as const).forEach(([k, v, yy]) => {
      const w = Math.max(1, Math.abs(x(v) - xz));
      const left = v < 0 ? xz - w : xz;
      const name = k === "a" ? o.series[0] : o.series[1];
      nodes.push({ t: "rect", x: r1(left), y: yy, w: r1(w), h: bar, c: k === "a" ? "kc-c-a" : "kc-c-b", title: `${r.label}, ${name}: ${fmt(v)}` });
      nodes.push(
        v < 0
          ? { t: "text", x: r1(left - 5), y: r1(yy + bar - 2.5), s: fmt(v), c: k === "b" ? "kc-c-value" : "kc-c-tick", a: "end" }
          : { t: "text", x: r1(left + w + 5), y: r1(yy + bar - 2.5), s: fmt(v), c: k === "b" ? "kc-c-value" : "kc-c-tick", a: "start" },
      );
    });
  });
  return { w: W, h: H, label: o.label, nodes };
}

/* ---------- Line chart ---------- */

export type Point = { x: number; y: number };
export type Series = { name: string; points: Point[] };

export type LineOptions = {
  series: Series[];
  label: string;
  xFormat?: Format;
  yFormat?: Format;
  /** Dashed horizontal lines, such as a margin-call level. */
  limits?: { y: number; label: string }[];
  /** Start the y axis at zero (default true for amounts; set false for prices that never near zero). */
  zero?: boolean;
  /** Shade under the first series. */
  area?: boolean;
  width?: number;
  /**
   * A number in px; "bank" for the median-absolute-slope heuristic (bankTo45); "arc" for arc-length banking
   * (bankArcLength). Default: width / phi^2 (a convention). Any height is raised so the value axis is at least
   * MIN_VALUE_AXIS CSS px at the smallest drawn width.
   */
  height?: number | "bank" | "arc";
  xTicks?: number[];
};

/** Lines on a shared y scale, each labelled at its end with name and last value. */
export function lineChart(o: LineOptions): Drawing {
  const W = o.width ?? 720;
  const H0 = o.height === "bank" ? Math.round(W * bankTo45(o.series[0].points)) : o.height === "arc" ? Math.round(W * bankArcLength(o.series[0].points)) : o.height ?? Math.round(W / PHI_ ** 2);
  const H = Math.max(H0, 13 + 26 + Math.ceil(MIN_VALUE_AXIS / minScale(W)));
  const fy = o.yFormat ?? ((v: number) => num(v));
  const fx = o.xFormat ?? ((v: number) => num(v));
  const all = o.series.flatMap((s) => s.points);
  const ys = all.map((p) => p.y).concat((o.limits ?? []).map((l) => l.y));
  const xs = all.map((p) => p.x);
  const yt = gridTicks(o.zero === false ? Math.min(...ys) : Math.min(0, ...ys), Math.max(...ys), H - 39, minScale(W), 5);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const ends = o.series.map((s) => {
    const last = s.points[s.points.length - 1];
    return { s, last, text: o.series.length > 1 ? `${s.name} ${fy(last.y)}` : fy(last.y) };
  });
  const left = Math.max(...yt.map((t) => textWidth(fy(t)))) + 13;
  const right = Math.max(...ends.map((e) => textWidth(e.text))) + 13;
  const top = 13, bottom = H - 26;
  const x = linear(xMin, xMax, left, W - right);
  const y = linear(yt[0], yt[yt.length - 1], bottom, top);
  const nodes: ChartNode[] = [];
  for (const t of yt) {
    const ty = r1(y(t));
    nodes.push({ t: "line", x1: left, x2: W - right, y1: ty, y2: ty, c: t === yt[0] ? "kc-c-axis" : "kc-c-grid" });
    nodes.push({ t: "text", x: left - 8, y: r1(ty + 4.5), s: fy(t), c: "kc-c-tick", a: "end" });
  }
  const xt = o.xTicks ?? (() => {
    const pts = o.series[0].points, n = Math.min(5, pts.length);
    return Array.from({ length: n }, (_, i) => pts[Math.round((i * (pts.length - 1)) / Math.max(1, n - 1))].x);
  })();
  xt.forEach((t, i) => {
    nodes.push({ t: "text", x: r1(x(t)), y: H - 6, s: fx(t), c: "kc-c-tick", a: i === 0 ? "start" : i === xt.length - 1 ? "end" : "middle" });
  });
  for (const l of o.limits ?? []) {
    const ly = r1(y(l.y));
    nodes.push({ t: "line", x1: left, x2: W - right, y1: ly, y2: ly, c: "kc-c-limit" });
    nodes.push({ t: "text", x: left + 5, y: r1(ly - 5), s: `${l.label} ${fy(l.y)}`, c: "kc-c-tick", a: "start" });
  }
  o.series.forEach((s, i) => {
    const d = s.points.map((p, j) => `${j ? "L" : "M"}${r1(x(p.x))} ${r1(y(p.y))}`).join("");
    if (i === 0 && o.area) {
      const first = s.points[0], last = s.points[s.points.length - 1];
      nodes.push({ t: "path", d: `${d}L${r1(x(last.x))} ${r1(bottom)}L${r1(x(first.x))} ${r1(bottom)}Z`, c: "kc-c-area" });
    }
    nodes.push({ t: "path", d, c: i === 0 ? "kc-c-line" : `kc-c-line kc-c-line--${Math.min(i + 1, 4)}` });
  });
  // End labels, pushed apart so they never overlap.
  const placed = ends.map((e) => ({ ...e, ly: y(e.last.y) + 4.5 })).sort((a, b) => a.ly - b.ly);
  for (let i = 1; i < placed.length; i++) placed[i].ly = Math.max(placed[i].ly, placed[i - 1].ly + 15);
  for (const p of placed) {
    nodes.push({ t: "circle", x: r1(x(p.last.x)), y: r1(y(p.last.y)), r: 2.5, c: "kc-c-dot" });
    nodes.push({ t: "text", x: r1(W - right + 8), y: r1(p.ly), s: p.text, c: "kc-c-value", a: "start" });
  }
  return { w: W, h: H, label: o.label, nodes };
}

/* ---------- Sparkline ---------- */

export type SparkOptions = { values: number[]; label: string; width?: number; height?: number; format?: Format };

/** A small line with the last point marked. The label states first, last, low and high in words. */
export function sparkline(o: SparkOptions): Drawing {
  const W = o.width ?? 89, H = o.height ?? 21, pad = 3;
  const v = o.values.length ? o.values : [0];
  const f = o.format ?? ((n: number) => num(n, 2));
  const lo = Math.min(...v), hi = Math.max(...v);
  const x = linear(0, Math.max(1, v.length - 1), pad, W - pad);
  const y = linear(lo, hi, H - pad, pad);
  const d = v.map((n, i) => `${i ? "L" : "M"}${r1(x(i))} ${r1(y(n))}`).join("");
  const label = `${o.label}: from ${f(v[0])} to ${f(v[v.length - 1])}, low ${f(lo)}, high ${f(hi)}`;
  return {
    w: W, h: H, label,
    nodes: [
      { t: "path", d, c: "kc-c-line" },
      { t: "circle", x: r1(x(v.length - 1)), y: r1(y(v[v.length - 1])), r: 2, c: "kc-c-dot" },
    ],
  };
}

/* ---------- Banking (aspect ratio from the data) ---------- */

/**
 * Aspect ratio (height / width) that makes the median absolute slope of the line segments 45 degrees on screen
 * (Cleveland, McGill and McGill 1988; median-absolute-slope method). A heuristic: 45 degrees is optimal only for
 * two segments (Heer and Agrawala 2006), and Talbot, Gerth and Hanrahan (2012) measured that slope-ratio errors
 * are generally not lowest at 45 degrees and that flatter charts often do better. Clamped to [1/phi^3, 1/phi]
 * (a convention) so a chart is never a sliver nor a square. docs/math.md shows the derivation.
 */
export function bankTo45(points: Point[]): number {
  if (points.length < 3) return 1 / PHI_ ** 2;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xr = Math.max(...xs) - Math.min(...xs) || 1, yr = Math.max(...ys) - Math.min(...ys) || 1;
  const slopes = points
    .slice(1)
    .map((p, i) => Math.abs((p.y - points[i].y) / yr) / Math.abs((p.x - points[i].x) / xr || 1e-9))
    .filter((s) => s > 0 && isFinite(s))
    .sort((a, b) => a - b);
  if (!slopes.length) return 1 / PHI_ ** 2;
  const median = slopes[Math.floor(slopes.length / 2)];
  return Math.min(1 / PHI_, Math.max(1 / PHI_ ** 3, 1 / median));
}

/**
 * Arc-length banking (Talbot, Gerth and Hanrahan 2011): the aspect ratio a = height / width that minimises the
 * length of the drawn line in a plot of constant area. With data normalised to [0, 1] on both axes and area 1,
 * width = 1 / sqrt(a) and height = sqrt(a), so the length is L(a) = sum sqrt(dx^2 / a + dy^2 a). L is convex in
 * log a; a golden-section search finds the minimum. Mathematically defined, and the authors note it has no
 * perceptual validation; same clamp as bankTo45.
 */
export function bankArcLength(points: Point[]): number {
  if (points.length < 3) return 1 / PHI_ ** 2;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xr = Math.max(...xs) - Math.min(...xs) || 1, yr = Math.max(...ys) - Math.min(...ys) || 1;
  const d = points.slice(1).map((p, i) => [(p.x - points[i].x) / xr, (p.y - points[i].y) / yr]);
  const length = (logA: number) => {
    const a = Math.exp(logA);
    return d.reduce((s, [dx, dy]) => s + Math.sqrt((dx * dx) / a + dy * dy * a), 0);
  };
  let lo = Math.log(1 / PHI_ ** 3), hi = Math.log(1 / PHI_);
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 60; i++) {
    const m1 = hi - g * (hi - lo), m2 = lo + g * (hi - lo);
    if (length(m1) <= length(m2)) hi = m2;
    else lo = m1;
  }
  return Math.exp((lo + hi) / 2);
}

/* ---------- Columns (vertical bars over time or categories) ---------- */

export type ColumnOptions = {
  values: { label: string; value: number }[];
  label: string;
  format?: Format;
  /** Colour by sign: "up"/"down" for changes; "series" (default) draws every column in the first series colour. */
  tone?: "series" | "sign";
  /** Label every nth category on the axis (default: about 8 labels). */
  every?: number;
  /** Mark the last column with its value. */
  labelLast?: boolean;
  width?: number;
  height?: number;
};

export function columns(o: ColumnOptions): Drawing {
  const W = o.width ?? 720, H = Math.max(o.height ?? Math.round(W / PHI_ ** 2), 21 + 26 + Math.ceil(MIN_VALUE_AXIS / minScale(W)));
  const fmt = o.format ?? ((v: number) => num(v));
  const values = o.values.filter((v) => isFinite(v.value)); // a gap in the data is skipped, not drawn as zero
  const vals = values.map((v) => v.value);
  const yt = gridTicks(Math.min(0, ...vals), Math.max(0, ...vals), H - 47, minScale(W), 5);
  const lastLabel = values[values.length - 1]?.label ?? "";
  const left = Math.max(...yt.map((t) => textWidth(fmt(t)))) + 13;
  const right = Math.max(textWidth(lastLabel), o.labelLast === false ? 0 : textWidth(fmt(vals[vals.length - 1]))) / 2 + 2;
  const top = 21, bottom = H - 26;
  const y = linear(yt[0], yt[yt.length - 1], bottom, top);
  const n = values.length, step = (W - left - right) / Math.max(1, n), bw = Math.max(1, step * 0.72);
  const every = o.every ?? Math.max(1, Math.ceil(n / 8));
  const nodes: ChartNode[] = [];
  for (const t of yt) {
    const ty = r1(y(t));
    nodes.push({ t: "line", x1: left, x2: W - right, y1: ty, y2: ty, c: t === 0 ? "kc-c-axis" : "kc-c-grid" });
    nodes.push({ t: "text", x: left - 8, y: r1(ty + 4.5), s: fmt(t), c: "kc-c-tick", a: "end" });
  }
  values.forEach((v, i) => {
    const x = left + i * step + (step - bw) / 2, y0 = y(0), y1 = y(v.value);
    const c = o.tone === "sign" ? (shownZero(fmt(v.value)) ? "kc-c-a" : v.value > 0 ? "kc-c-up" : "kc-c-down") : "kc-c-b";
    nodes.push({ t: "rect", x: r1(x), y: r1(Math.min(y0, y1)), w: r1(bw), h: r1(Math.max(1, Math.abs(y1 - y0))), c, title: `${v.label}: ${fmt(v.value)}` });
    if (i % every === 0 || i === n - 1) nodes.push({ t: "text", x: r1(x + bw / 2), y: H - 6, s: v.label, c: "kc-c-tick", a: "middle" });
  });
  if (o.labelLast !== false && n) {
    const last = values[n - 1], x = left + (n - 1) * step + step / 2;
    const ly = last.value < 0 ? Math.max(y(last.value), y(0)) + 15 : Math.min(y(last.value), y(0)) - 6;
    nodes.push({ t: "text", x: r1(x), y: r1(ly), s: fmt(last.value), c: "kc-c-value", a: "middle" });
  }
  return { w: W, h: H, label: o.label, nodes };
}

/* ---------- Stacked area ---------- */

export type StackedOptions = {
  /** x values shared by every layer. */
  x: number[];
  /** Layers from the bottom up; each has one value per x (zero or more). */
  layers: { name: string; values: number[] }[];
  label: string;
  xFormat?: Format;
  yFormat?: Format;
  width?: number;
  height?: number;
};

/** Layers stacked from zero, filled with the categorical colours in order, each named at its right end. */
export function stackedArea(o: StackedOptions): Drawing {
  const W = o.width ?? 720, H = Math.max(o.height ?? Math.round(W / PHI_ ** 2), 13 + 26 + Math.ceil(MIN_VALUE_AXIS / minScale(W)));
  const fy = o.yFormat ?? ((v: number) => num(v)), fx = o.xFormat ?? ((v: number) => num(v));
  const tops = o.x.map((_, i) => o.layers.reduce((s, l) => s + Math.max(0, l.values[i] ?? 0), 0));
  const yt = gridTicks(0, Math.max(...tops), H - 39, minScale(W), 5);
  const names = o.layers.map((l) => `${l.name} ${fy(l.values[l.values.length - 1] ?? 0)}`);
  const left = Math.max(...yt.map((t) => textWidth(fy(t)))) + 13, right = Math.max(...names.map((s) => textWidth(s))) + 13;
  const top = 13, bottom = H - 26;
  const x = linear(o.x[0], o.x[o.x.length - 1], left, W - right);
  const y = linear(0, yt[yt.length - 1], bottom, top);
  const nodes: ChartNode[] = [];
  for (const t of yt) {
    const ty = r1(y(t));
    nodes.push({ t: "line", x1: left, x2: W - right, y1: ty, y2: ty, c: t === 0 ? "kc-c-axis" : "kc-c-grid" });
    nodes.push({ t: "text", x: left - 8, y: r1(ty + 4.5), s: fy(t), c: "kc-c-tick", a: "end" });
  }
  const base = o.x.map(() => 0);
  const mids: { y: number; s: string; i: number }[] = [];
  o.layers.forEach((l, li) => {
    const lo = base.slice();
    const hi = lo.map((b, i) => b + Math.max(0, l.values[i] ?? 0));
    const up = hi.map((v, i) => `${i ? "L" : "M"}${r1(x(o.x[i]))} ${r1(y(v))}`).join("");
    const down = lo.map((v, i) => `L${r1(x(o.x[i]))} ${r1(y(v))}`).reverse().join("");
    nodes.push({ t: "path", d: `${up}${down}Z`, c: `kc-c-cat-${(li % 8) + 1} kc-c-layer` });
    const n = o.x.length - 1;
    mids.push({ y: (y(lo[n]) + y(hi[n])) / 2 + 4.5, s: names[li], i: li });
    hi.forEach((v, i) => (base[i] = v));
  });
  mids.sort((a, b) => b.y - a.y);
  for (let i = 1; i < mids.length; i++) mids[i].y = Math.min(mids[i].y, mids[i - 1].y - 15);
  for (const m of mids) nodes.push({ t: "text", x: r1(W - right + 8), y: r1(m.y), s: m.s, c: "kc-c-value", a: "start" });
  const n = Math.min(5, o.x.length);
  for (let i = 0; i < n; i++) {
    const v = o.x[Math.round((i * (o.x.length - 1)) / Math.max(1, n - 1))];
    nodes.push({ t: "text", x: r1(x(v)), y: H - 6, s: fx(v), c: "kc-c-tick", a: i === 0 ? "start" : i === n - 1 ? "end" : "middle" });
  }
  return { w: W, h: H, label: o.label, nodes };
}

/* ---------- Heatmap ---------- */

export type HeatmapOptions = {
  rows: string[];
  cols: string[];
  /** values[row][col]; NaN for no data. */
  values: number[][];
  label: string;
  /** "diverging" (default): 9 steps, worse to better around `mid`. "sequential": 9 steps, low to high. */
  scale?: "diverging" | "sequential";
  mid?: number;
  /** Which sign is good for a diverging scale (default "positive"). */
  better?: "positive" | "negative";
  format?: Format;
  /** Print the value in each cell (default true): the number, not the colour, carries the meaning. */
  showValues?: boolean;
  cell?: number;
  width?: number;
};

/** A grid of cells coloured on the 9-step scales (classes kc-c-div-1..9 / kc-c-seq-1..9), values printed in the
 * text colour the build measured for each step (kc-c-on-div-N / kc-c-on-seq-N). */
export function heatmap(o: HeatmapOptions): Drawing {
  const fmt = o.format ?? ((v: number) => num(v, 1));
  const cw = o.cell ?? 55, ch = 27;
  const labelW = Math.max(...o.rows.map((r) => textWidth(r))) + 13;
  const W = o.width ?? labelW + o.cols.length * cw, top = 21;
  const H = top + o.rows.length * ch + 2;
  const flat = o.values.flat().filter((v) => isFinite(v));
  const mid = o.mid ?? 0;
  const ext = Math.max(...flat.map((v) => Math.abs(v - mid)), 1e-9);
  const lo = Math.min(...flat), hi = Math.max(...flat);
  const step = (v: number) => {
    if (o.scale === "sequential") return 1 + Math.min(8, Math.floor(((v - lo) / (hi - lo || 1)) * 9));
    const s = (v - mid) / ext * (o.better === "negative" ? -1 : 1); // -1..1, positive = better
    return 5 + Math.max(-4, Math.min(4, Math.round(s * 4)));
  };
  const nodes: ChartNode[] = [];
  o.cols.forEach((c, j) => nodes.push({ t: "text", x: r1(labelW + j * cw + cw / 2), y: 13, s: c, c: "kc-c-tick", a: "middle" }));
  o.rows.forEach((r, i) => {
    const y = top + i * ch;
    nodes.push({ t: "text", x: labelW - 8, y: r1(y + ch / 2 + 4.5), s: r, c: "kc-c-label", a: "end" });
    o.cols.forEach((c, j) => {
      const v = o.values[i]?.[j];
      const x = labelW + j * cw;
      if (v === undefined || !isFinite(v)) {
        nodes.push({ t: "rect", x: r1(x + 1), y: y + 1, w: cw - 2, h: ch - 2, c: "kc-c-empty", title: `${r}, ${c}: no data` });
        return;
      }
      const k = step(v);
      const kind = o.scale === "sequential" ? "seq" : "div";
      nodes.push({ t: "rect", x: r1(x + 1), y: y + 1, w: cw - 2, h: ch - 2, c: `kc-c-${kind}-${k}`, title: `${r}, ${c}: ${fmt(v)}` });
      if (o.showValues !== false) {
        nodes.push({ t: "text", x: r1(x + cw / 2), y: r1(y + ch / 2 + 4.5), s: fmt(v), c: `kc-c-cell kc-c-on-${kind}-${k}`, a: "middle" });
      }
    });
  });
  return { w: W, h: H, label: o.label, nodes };
}

/* ---------- SVG string, for pages without React ---------- */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The drawing as an SVG string. `cls` is "kc-spark" for sparklines. */
export function toSvg(d: Drawing, cls = ""): string {
  const body = d.nodes
    .map((n) => {
      switch (n.t) {
        case "line":
          return `<line x1="${n.x1}" y1="${n.y1}" x2="${n.x2}" y2="${n.y2}" class="${n.c}"/>`;
        case "rect":
          return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" class="${n.c}">${n.title ? `<title>${esc(n.title)}</title>` : ""}</rect>`;
        case "text":
          return `<text x="${n.x}" y="${n.y}" class="${n.c}"${n.a && n.a !== "start" ? ` text-anchor="${n.a}"` : ""}>${esc(n.s)}</text>`;
        case "path":
          return `<path d="${n.d}" class="${n.c}"/>`;
        case "circle":
          return `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" class="${n.c}"/>`;
      }
    })
    .join("");
  const size = cls === "kc-spark" ? ` width="${d.w}" height="${d.h}"` : ` style="max-width:${d.w}px;min-width:${Math.min(d.w, 520)}px"`;
  return `<svg viewBox="0 0 ${d.w} ${d.h}"${size} role="img" aria-label="${esc(d.label)}"${cls ? ` class="${cls}"` : ""}>${body}</svg>`;
}
