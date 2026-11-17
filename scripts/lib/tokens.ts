/*
 * Computes every token value from the parameters in tokens/tokens.json. Nothing here is a hand-typed size or colour:
 * scales come from phi and Fibonacci, colours from OKLCH ramps (docs/math.md, docs/colour.md).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { apca, deltaE, fmtOklch, hexToOklch, minPairDistance, oklchToHex, simulate, wcag, type Cvd, type LCH } from "./color.ts";

export const PHI = (1 + Math.sqrt(5)) / 2;
export const CVDS: Cvd[] = ["protanopia", "deuteranopia", "tritanopia"];
export type Mode = "light" | "dark";
export const MODES: Mode[] = ["light", "dark"];

type Entry = { value?: unknown; light?: string; dark?: string; use?: string };
type Group = Record<string, Entry>;
export type Raw = {
  version: string;
  palette: { steps: Record<string, number>; ramps: Record<string, { h: number; c: number; flat?: boolean; use: string }> };
  color: Group;
  chart: Group & {
    categorical: { names: string[]; light: string[]; dark: string[] };
    sequential: { light: string[]; dark: string[] };
    diverging: { light: string[]; dark: string[] };
  };
  font: Group; weight: Group; leading: Group; tracking: Group; rule: Group; radius: Group; motion: Group;
  type: { anchor: number; text: { step: number; names: string[] }; display: { names: Record<string, number> }; use: Record<string, string> };
  space: { seed: [number, number]; count: number; use: Record<string, string> };
  layout: { fibonacciIndex: number; columns: number; gutterStep: string; readColumns: number; wideColumns: number; controlHeight: number };
  evidence: {
    floors: Record<"runningTextPx" | "lineHeight" | "minCharsPerLine" | "targetPx" | "chartValueAxisPx" | "gridGapPx", { value: number; basis: string; use: string }>;
    cvd: { minDeltaE: { value: number; basis: string; use: string } };
  };
  budget: Record<string, unknown>;
  contrast: { pairs: { fg: string; bg: string; min: number; apca: number; use: string }[] };
};

export const entries = (g: object) => Object.entries(g).filter(([k]) => !k.startsWith("$")) as [string, Entry][];

export function loadRaw(root: string): Raw {
  return JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8")) as Raw;
}

const fib = (n: number) => {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
};

export type Swatch = { hex: string; oklch: string };

export function compute(raw: Raw) {
  /* ---------- Ramps ---------- */
  const ramps: Record<string, Record<string, Swatch>> = {};
  for (const [name, r] of Object.entries(raw.palette.ramps)) {
    ramps[name] = {};
    for (const [step, L] of Object.entries(raw.palette.steps)) {
      const cWanted = r.flat ? r.c : r.c * (0.35 + 0.65 * Math.sin(Math.PI * L));
      const { hex, chroma } = oklchToHex([L, cWanted, r.h]);
      ramps[name][step] = { hex, oklch: fmtOklch([L, chroma, r.h]) };
    }
  }

  const resolve = (v: string): Swatch => {
    if (v.startsWith("#")) return { hex: v.toUpperCase(), oklch: fmtOklch(hexToOklch(v)) };
    const m = v.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
    if (m) {
      const lch = [Number(m[1]), Number(m[2]), Number(m[3])] as LCH;
      const { hex, chroma } = oklchToHex(lch);
      return { hex, oklch: fmtOklch([lch[0], chroma, lch[2]]) };
    }
    const [ramp, step] = v.split(".");
    const s = ramps[ramp]?.[step];
    if (!s) throw new Error(`unknown colour reference: ${v}`);
    return s;
  };

  const themed = (g: Group) =>
    Object.fromEntries(
      entries(g)
        .filter(([, e]) => typeof e.light === "string")
        .map(([k, e]) => [k, { light: resolve(e.light!), dark: resolve(e.dark!), ref: { light: e.light!, dark: e.dark! }, use: e.use ?? "" }]),
    );
  const color = themed(raw.color);
  const chart = themed(raw.chart);
  const list = (l: { light: string[]; dark: string[] }) => ({ light: l.light.map(resolve), dark: l.dark.map(resolve), ref: l });
  const categorical = { names: raw.chart.categorical.names, ...list(raw.chart.categorical) };
  const sequential = list(raw.chart.sequential);
  const diverging = list(raw.chart.diverging);

  /* ---------- Type ---------- */
  const t = raw.type;
  const text: Record<string, { px: number; exact: number; formula: string; use: string }> = {};
  t.text.names.forEach((n, i) => {
    const v = t.anchor + i * t.text.step;
    text[n] = { px: v, exact: v, formula: `${t.anchor} + ${i} x ${t.text.step}`, use: t.use[n] };
  });
  for (const [n, k] of Object.entries(t.display.names)) {
    const exact = t.anchor * Math.sqrt(PHI) ** k;
    text[n] = { px: Math.round(exact), exact: Math.round(exact * 100) / 100, formula: `${t.anchor} x sqrt(phi)^${k}`, use: t.use[n] };
  }

  /* ---------- Space ---------- */
  const space: Record<string, { px: number; use: string }> = {};
  const seq = [...raw.space.seed];
  while (seq.length < raw.space.count) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  seq.forEach((v, i) => (space[`s${i + 1}`] = { px: v, use: raw.space.use[`s${i + 1}`] }));

  /* ---------- Layout ---------- */
  const L = raw.layout;
  const page = fib(L.fibonacciIndex);
  const golden = Math.round(page / PHI);
  const gutter = space[L.gutterStep].px;
  const column = (page - (L.columns - 1) * gutter) / L.columns;
  if (!Number.isInteger(column)) throw new Error(`layout: column width ${column} is not a whole pixel`);
  const span = (n: number) => n * column + (n - 1) * gutter;
  const layout = {
    page: { px: page, formula: `F(${L.fibonacciIndex})`, use: "Max width of the page content." },
    golden: { px: golden, formula: "page / phi", use: "The wide side of the golden split: the main column beside an aside." },
    aside: { px: page - golden, formula: "page - golden", use: "The narrow side of the golden split: margin notes, a form beside a result." },
    measure: { px: span(L.readColumns), formula: `${L.readColumns} of ${L.columns} columns`, use: "Max width of serif reading text and the lede (about 66 characters)." },
    "measure-wide": { px: span(L.wideColumns), formula: `${L.wideColumns} of ${L.columns} columns`, use: "Max width of sans notes and footnotes (about 75 characters)." },
    column: { px: column, formula: `(page - ${L.columns - 1} x gutter) / ${L.columns}`, use: "One column of the 12-column grid." },
    "grid-gutter": { px: gutter, formula: L.gutterStep, use: "Gap between grid columns." },
    "control-height": { px: L.controlHeight, formula: "touch target", use: "Buttons, inputs, selects, segmented control." },
  };

  /* ---------- Contrast ---------- */
  const pick = (ref: string, mode: Mode): string => {
    const [group, key] = ref.split(/\.(.+)/);
    const src = group === "color" ? color : group === "chart" ? chart : null;
    const s = src?.[key]?.[mode];
    if (!s) throw new Error(`contrast pair: unknown token ${ref}`);
    return s.hex;
  };
  const measureRow = (fg: string, bg: string, min: number, target: number, use: string, fgs: Record<Mode, string>, bgs: Record<Mode, string>) => ({
    fg, bg, min, apcaTarget: target, use,
    light: { wcag: wcag(fgs.light, bgs.light), apca: apca(fgs.light, bgs.light) },
    dark: { wcag: wcag(fgs.dark, bgs.dark), apca: apca(fgs.dark, bgs.dark) },
  });
  const pairs = raw.contrast.pairs.map((p) =>
    measureRow(p.fg, p.bg, p.min, p.apca, p.use, { light: pick(p.fg, "light"), dark: pick(p.fg, "dark") }, { light: pick(p.bg, "light"), dark: pick(p.bg, "dark") }),
  );
  const paper = { light: color.paper.light.hex, dark: color.paper.dark.hex };
  const marks = [
    ...categorical.names.map((n, i) => measureRow(`categorical ${i + 1} (${n})`, "color.paper", 3, 30, "Series mark", { light: categorical.light[i].hex, dark: categorical.dark[i].hex }, paper)),
    measureRow("sequential, darkest step", "color.paper", 3, 30, "Highest value", { light: sequential.light.at(-1)!.hex, dark: sequential.dark.at(-1)!.hex }, paper),
    measureRow("diverging, worse end", "color.paper", 3, 30, "Worst value", { light: diverging.light[0].hex, dark: diverging.dark[0].hex }, paper),
    measureRow("diverging, better end", "color.paper", 3, 30, "Best value", { light: diverging.light.at(-1)!.hex, dark: diverging.dark.at(-1)!.hex }, paper),
  ];
  // Heatmap cells print their value. For each step and theme the text is ink or paper, whichever contrasts more;
  // the build emits it as --kc-seq-on-N / --kc-div-on-N and checks it as text.
  const ink = { light: color.ink.light.hex, dark: color.ink.dark.hex };
  const onFill = (fill: string, mode: Mode) => (wcag(ink[mode], fill) >= wcag(paper[mode], fill) ? ink[mode] : paper[mode]);
  const textOn = {
    sequential: { light: sequential.light.map((c) => onFill(c.hex, "light")), dark: sequential.dark.map((c) => onFill(c.hex, "dark")) },
    diverging: { light: diverging.light.map((c) => onFill(c.hex, "light")), dark: diverging.dark.map((c) => onFill(c.hex, "dark")) },
  };
  const cells = (["diverging", "sequential"] as const).flatMap((kind) =>
    Array.from({ length: 9 }, (_, i) => {
      const scale = kind === "sequential" ? sequential : diverging;
      return measureRow("cell text (ink or paper)", `${kind} step ${i + 1}`, 4.5, 60, "Heatmap value", { light: textOn[kind].light[i], dark: textOn[kind].dark[i] }, { light: scale.light[i].hex, dark: scale.dark[i].hex });
    }),
  );
  const contrast = [...pairs, ...marks, ...cells];
  const failures = contrast.filter((c) => c.light.wcag < c.min || c.dark.wcag < c.min);

  /* ---------- Colour vision ---------- */
  const view = (hexes: string[], m: Cvd | "normal") => (m === "normal" ? hexes : hexes.map((h) => simulate(h, m)));
  const visions = ["normal", ...CVDS] as const;
  const cvd = MODES.map((mode) => {
    const cat = categorical[mode].map((s) => s.hex);
    const div = diverging[mode].map((s) => s.hex);
    const updown = [color.up[mode].hex, color.down[mode].hex];
    return {
      mode,
      categorical: [4, 6, 8].map((k) => ({
        first: k,
        min: Object.fromEntries(visions.map((v) => [v, minPairDistance(view(cat.slice(0, k), v), categorical.names.slice(0, k))])),
      })),
      upDown: Object.fromEntries(visions.map((v) => [v, deltaE(...(view(updown, v) as [string, string]))])),
      divergingMirror: Object.fromEntries(
        visions.map((v) => {
          const s = view(div, v);
          return [v, Math.min(...[0, 1, 2, 3].map((i) => deltaE(s[i], s[s.length - 1 - i])))];
        }),
      ),
      divergingAdjacent: Object.fromEntries(
        visions.map((v) => {
          const s = view(div, v);
          return [v, Math.min(...s.slice(1).map((h, i) => deltaE(h, s[i])))];
        }),
      ),
      sequentialAdjacent: Object.fromEntries(
        visions.map((v) => {
          const s = view(sequential[mode].map((x) => x.hex), v);
          return [v, Math.min(...s.slice(1).map((h, i) => deltaE(h, s[i])))];
        }),
      ),
      simulated: Object.fromEntries(CVDS.map((v) => [v, { categorical: view(cat, v), upDown: view(updown, v), diverging: view(div, v) }])),
    };
  });

  /* ---------- Colour-vision gate: pairs that carry meaning ---------- */
  // Each pair is simulated (Machado 2009, severity 1, linear sRGB) and compared in OKLab. Protanopia and
  // deuteranopia are gated at evidence.cvd.minDeltaE (a convention, docs/evidence.md). Tritanopia is reported only:
  // Machado et al. say their model handles tritan deficiency poorly.
  const minDeltaE = raw.evidence.cvd.minDeltaE.value;
  const meaningPairs = (mode: Mode): { name: string; a: string; b: string }[] => {
    const cat = categorical[mode], div = diverging[mode];
    return [
      { name: "up vs down (text)", a: color.up[mode].hex, b: color.down[mode].hex },
      { name: "up vs watch (text)", a: color.up[mode].hex, b: color.watch[mode].hex },
      { name: "down vs watch (text)", a: color.down[mode].hex, b: color.watch[mode].hex },
      { name: "chart up vs chart down", a: chart.up[mode].hex, b: chart.down[mode].hex },
      { name: "baseline (neutral) vs subject (ink)", a: chart.neutral[mode].hex, b: categorical[mode][0].hex },
      ...[0, 1, 2].flatMap((i) => [1, 2, 3].filter((j) => j > i).map((j) => ({ name: `categorical ${categorical.names[i]} vs ${categorical.names[j]}`, a: cat[i].hex, b: cat[j].hex }))),
      ...[0, 1, 2, 3].map((i) => ({ name: `diverging step ${i + 1} vs ${9 - i} (same lightness, opposite side)`, a: div[i].hex, b: div[8 - i].hex })),
    ];
  };
  const cvdGate = MODES.flatMap((mode) =>
    meaningPairs(mode).map((p) => {
      const d = Object.fromEntries(visions.map((v) => [v, deltaE(...(view([p.a, p.b], v) as [string, string]))])) as Record<(typeof visions)[number], number>;
      return { mode, ...p, d, pass: d.protanopia >= minDeltaE && d.deuteranopia >= minDeltaE };
    }),
  );
  const cvdFailures = cvdGate.filter((g) => !g.pass);

  return { version: raw.version, textOn, ramps, steps: raw.palette.steps, rampMeta: raw.palette.ramps, color, chart, categorical, sequential, diverging, text, space, layout, contrast, failures, cvd, cvdGate, cvdFailures, minDeltaE };
}

export type Computed = ReturnType<typeof compute>;
