/*
 * Colour maths for the token build. No dependencies; every formula has its source.
 *
 * - OKLab / OKLCH: Björn Ottosson, "A perceptual color space for image processing" (2020),
 *   https://bottosson.github.io/posts/oklab/ (matrices copied from there).
 * - sRGB transfer function and WCAG 2.2 relative luminance / contrast ratio:
 *   https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * - APCA (Accessible Perceptual Contrast Algorithm) 0.0.98G-4g constants, as published in apca-w3 0.1.9:
 *   https://github.com/Myndex/apca-w3 . APCA is the candidate method for WCAG 3; we record it, WCAG 2.2 is the gate.
 * - Colour-vision-deficiency simulation: Machado, Oliveira and Fernandes, "A Physiologically-based Model for
 *   Simulation of Color Vision Deficiency", IEEE TVCG 2009, severity 1.0 matrices, applied to linear RGB:
 *   https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
 */

export type RGB = [number, number, number]; // 0..1, gamma-encoded sRGB
export type Lab = [number, number, number]; // OKLab
export type LCH = [number, number, number]; // OKLCH: L 0..1, C, H degrees

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex(rgb: RGB): string {
  return "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function linearRgbToOklab([r, g, b]: RGB): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToLinearRgb([L, a, b]: Lab): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export const lchToLab = ([L, C, H]: LCH): Lab => [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
export const labToLch = ([L, a, b]: Lab): LCH => {
  const H = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, Math.hypot(a, b), H < 0 ? H + 360 : H];
};

export const hexToOklab = (hex: string): Lab => linearRgbToOklab(hexToRgb(hex).map(toLinear) as RGB);
export const hexToOklch = (hex: string): LCH => labToLch(hexToOklab(hex));

const inGamut = (rgb: RGB) => rgb.every((c) => c >= -1e-6 && c <= 1 + 1e-6);

/**
 * OKLCH to hex. Out-of-gamut colours keep L and H and lose chroma (binary search) until they fit sRGB,
 * the CSS Color 4 gamut-mapping idea without the JND shortcut. Returns the hex and the chroma used.
 */
export function oklchToHex(lch: LCH): { hex: string; chroma: number } {
  const [L, , H] = lch;
  let C = lch[1];
  let rgb = oklabToLinearRgb(lchToLab([L, C, H]));
  if (!inGamut(rgb)) {
    let lo = 0, hi = C;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklabToLinearRgb(lchToLab([L, mid, H])))) lo = mid;
      else hi = mid;
    }
    C = lo;
    rgb = oklabToLinearRgb(lchToLab([L, C, H]));
  }
  return { hex: rgbToHex(rgb.map((c) => toGamma(Math.min(1, Math.max(0, c)))) as RGB), chroma: C };
}

export const fmtOklch = ([L, C, H]: LCH) => `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`;

/* ---------- WCAG 2.2 ---------- */

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio, rounded down to 2 decimals so that a pass is a real pass. */
export function wcag(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return Math.floor(((x + 0.05) / (y + 0.05)) * 100) / 100;
}

/* ---------- APCA 0.0.98G-4g ---------- */

function apcaY(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => c ** 2.4);
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  return y < 0.022 ? y + (0.022 - y) ** 1.414 : y;
}

/** APCA lightness contrast Lc of text on background (signed: positive = dark text on light). Rounded to 0.1. */
export function apca(text: string, bg: string): number {
  const yt = apcaY(text), yb = apcaY(bg);
  if (Math.abs(yb - yt) < 0.0005) return 0;
  let lc: number;
  if (yb > yt) {
    const s = (yb ** 0.56 - yt ** 0.57) * 1.14;
    lc = s < 0.1 ? 0 : s - 0.027;
  } else {
    const s = (yb ** 0.65 - yt ** 0.62) * 1.14;
    lc = s > -0.1 ? 0 : s + 0.027;
  }
  return Math.round(lc * 1000) / 10;
}

/* ---------- Colour-vision deficiency (Machado 2009, severity 1.0) ---------- */

export type Cvd = "protanopia" | "deuteranopia" | "tritanopia";
const MACHADO: Record<Cvd, number[]> = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
};

export function simulate(hex: string, kind: Cvd): string {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const m = MACHADO[kind];
  const out: RGB = [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b];
  return rgbToHex(out.map((c) => toGamma(Math.min(1, Math.max(0, c)))) as RGB);
}

/** Perceptual distance: Euclidean distance in OKLab, times 100 (about 2 is a just-noticeable difference). */
export function deltaE(a: string, b: string): number {
  const p = hexToOklab(a), q = hexToOklab(b);
  return Math.round(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * 1000) / 10;
}

/** Smallest pairwise deltaE in a set, with the pair. */
export function minPairDistance(hexes: string[], names: string[]): { d: number; pair: [string, string] } {
  let best = { d: Infinity, pair: ["", ""] as [string, string] };
  for (let i = 0; i < hexes.length; i++)
    for (let j = i + 1; j < hexes.length; j++) {
      const d = deltaE(hexes[i], hexes[j]);
      if (d < best.d) best = { d, pair: [names[i], names[j]] };
    }
  return best;
}
