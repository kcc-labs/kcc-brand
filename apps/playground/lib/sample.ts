/*
 * Sample data for the docs and the example pages. Deterministic (seeded), so builds are identical.
 * Every page that shows it says "Sample data".
 */

/** Mulberry32: a small seeded PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random walk in log space: n daily prices from `start`, daily volatility `vol`. */
export function walk(seed: number, n: number, start: number, vol: number, drift = 0): number[] {
  const r = rng(seed);
  const out = [start];
  for (let i = 1; i < n; i++) {
    const z = (r() + r() + r() - 1.5) * 2; // roughly normal
    out.push(out[i - 1] * Math.exp(drift + vol * z));
  }
  return out;
}

const DAY = 86_400_000;
/** Day timestamps ending on 17 Nov 2026 (UTC). */
export const days = (n: number) => Array.from({ length: n }, (_, i) => Date.UTC(2026, 10, 17) - (n - 1 - i) * DAY);

export const shortDate = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/* ---------- CC market monitor (sample) ---------- */

export const ccPrice = walk(7, 90, 0.142, 0.028, 0.0006);
export const ccDays = days(90);
export const venues = ["Venue A", "Venue B", "Venue C", "Venue D", "Venue E"];
export const depthNow = [6.8, 4.1, 3.3, 2.2, 1.6]; // M CC within 2%
export const depthWeekAgo = [7.4, 3.6, 3.9, 2.4, 1.1];
export const burnMint = walk(11, 30, 0.92, 0.04);

/** Weekly change of a measure by venue (rows) and week (columns), percent. */
export const heat = (() => {
  const r = rng(21);
  return venues.map(() => Array.from({ length: 8 }, () => Math.round((r() - 0.48) * 40 * 10) / 10));
})();
export const weeks = Array.from({ length: 8 }, (_, i) => `W${38 + i}`);

/** Collateral mix over 26 weeks, M USD. */
export const mix = (() => {
  const r = rng(5);
  const x = Array.from({ length: 26 }, (_, i) => i);
  const layer = (base: number, g: number) => x.map((i) => Math.max(0, base * (1 + g * i) * (0.9 + r() * 0.2)));
  return {
    x,
    layers: [
      { name: "CC", values: layer(1.2, 0.03) },
      { name: "CBTC", values: layer(0.6, 0.05) },
      { name: "USDCx", values: layer(0.9, 0.01) },
      { name: "Other", values: layer(0.2, 0.02) },
    ],
  };
})();
