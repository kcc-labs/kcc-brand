/*
 * Page gate: loads every playground page, every single-file template and the showcase in headless Chromium (Playwright) and
 * fails the build on any of these. docs/evidence.md gives the basis of each threshold.
 *
 *   1. Layout stability. Any layout shift > 0 (PerformanceObserver "layout-shift") while the page loads with
 *      web fonts delayed, with web fonts blocked, and with images delayed. Stricter than the web.dev "good" CLS
 *      of 0.1: the 0.1 limit is a field target for the 75th percentile of real loads; a template we control has
 *      no reason to shift at all, and any shift > 0 in a lab load is a cause we can fix.
 *   2. Typography floors (tokens.json -> evidence): running text size, line height and characters per line.
 *   3. Target size: WCAG 2.2 SC 2.5.8 (24 x 24 CSS px, with its spacing and inline exceptions).
 *   4. Charts: value axis >= 80 CSS px, gridlines >= 8 CSS px apart (Heer and Bostock 2010).
 *   5. Colour redundancy (WCAG 2.2 SC 1.4.1): diff chips carry a sign or a word, pills carry a word, up/down
 *      marks carry a signed value, heatmap cells print their value.
 *   6. Complexity budget (convention, Apple HIG "Simplicity"; tokens.json -> budget): font sizes, non-neutral colours,
 *      boxes inside boxes, border plus background, words in a heading. Over the budget fails; near it warns.
 *
 *   node scripts/check-pages.ts            run after `npm run build`
 *   node scripts/check-pages.ts --verbose  print every finding, including warnings
 *   node scripts/check-pages.ts --budget   also print the budget counts of every page (the largest of both viewports)
 */
import { spawn, type ChildProcess } from "node:child_process";
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer as netServer } from "node:net";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page, type Route } from "playwright";
import { entries, loadRaw } from "./lib/tokens.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const verbose = process.argv.includes("--verbose");
const raw = loadRaw(root);
const floors = Object.fromEntries(Object.entries(raw.evidence.floors).map(([k, v]) => [k, v.value])) as Record<string, number>;
/** Floors plus the complexity budget (tokens.json -> budget, a convention): "budget.<metric>" and "budget.<metric>.warn". */
const limits: Record<string, number> = { ...floors };
for (const [k, v] of entries(raw.budget)) {
  const b = v as { value: number; warn?: number };
  limits[`budget.${k}`] = b.value;
  if (b.warn !== undefined) limits[`budget.${k}.warn`] = b.warn;
}
const showBudget = process.argv.includes("--budget");
const require = createRequire(join(root, "packages/design/package.json"));
const fontDir = join(dirname(require.resolve("@fontsource/eb-garamond/package.json")), "files");

const FONT_DELAY = 1500; // ms: well past the 100 ms block period of font-display (CSS Fonts 4, section 4.9)
const IMAGE_DELAY = 800;

/* ---------- Servers ---------- */

const freePort = () =>
  new Promise<number>((res) => {
    const s = netServer().listen(0, () => {
      const p = (s.address() as { port: number }).port;
      s.close(() => res(p));
    });
  });

const TYPES: Record<string, string> = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json" };

/** Serves the repository read-only (html/, brand/ and showcase/), for the single-file pages. */
function staticServer(port: number): Promise<Server> {
  const s = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    const file = join(root, path);
    if (!file.startsWith(root) || !existsSync(file) || !/^\/(html|brand|showcase|scripts\/fixtures)\//.test(path)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  });
  return new Promise((r) => s.listen(port, () => r(s)));
}

async function startNext(port: number): Promise<ChildProcess> {
  if (!existsSync(join(root, "apps/playground/.next/BUILD_ID"))) throw new Error("run `npm run build` first: no Next build");
  const bin = join(root, "node_modules/.bin/next");
  const p = spawn(bin, ["start", "-p", String(port)], { cwd: join(root, "apps/playground"), stdio: "ignore" });
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://localhost:${port}/`)).ok) return p;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  p.kill();
  throw new Error("next start did not answer in 20 s");
}

/* ---------- Network conditions ---------- */

type Scenario = "fonts-delayed" | "fonts-blocked" | "fonts-ready";
const isFont = (url: string) => /\.woff2?(\?|$)/.test(url) || url.startsWith("https://fonts.googleapis.com/") || url.startsWith("https://fonts.gstatic.com/");
const isImage = (url: string) => /\.(png|svg|ico|jpe?g|webp)(\?|$)/.test(url);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Google Fonts stand-in: the same EB Garamond files (Fontsource ships Google's build), with the font-display value
 * the page asked for in its css2 URL. CI needs no network, and the result does not depend on Google's servers.
 */
function googleCss(url: string): string {
  const display = new URL(url).searchParams.get("display") ?? "auto";
  const face = (style: string, weight: number) =>
    `@font-face{font-family:'EB Garamond';font-style:${style};font-weight:${weight};font-display:${display};src:url(https://fonts.gstatic.com/kcc/eb-garamond-latin-${weight}-${style}.woff2) format('woff2');unicode-range:${latin};}`;
  const latin = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
  return [400, 500].flatMap((w) => [face("normal", w), face("italic", w)]).join("");
}

async function route(page: Page, scenario: Scenario) {
  await page.route("**/*", async (r: Route) => {
    const url = r.request().url();
    if (url.startsWith("https://example.com/brand/")) {
      await wait(IMAGE_DELAY);
      const file = join(root, new URL(url).pathname);
      if (!existsSync(file)) return r.fulfill({ status: 404 });
      return r.fulfill({ status: 200, contentType: TYPES[extname(file)] ?? "application/octet-stream", body: readFileSync(file) });
    }
    if (isFont(url)) {
      if (scenario === "fonts-blocked") return r.abort();
      if (scenario === "fonts-delayed") await wait(FONT_DELAY);
      if (url.startsWith("https://fonts.googleapis.com/")) return r.fulfill({ status: 200, contentType: "text/css", body: googleCss(url) });
      if (url.startsWith("https://fonts.gstatic.com/kcc/")) return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(join(fontDir, url.split("/").pop()!)) });
      return r.continue();
    }
    if (/^https?:\/\/(?!localhost)/.test(url)) return r.abort(); // nothing else leaves the machine
    if (isImage(url)) await wait(IMAGE_DELAY);
    return r.continue();
  });
}

/* ---------- In-page measurement ---------- */

const OBSERVE = `
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        value: e.value, t: Math.round(e.startTime),
        sources: (e.sources || []).map((s) => {
          const n = s.node, el = n && (n.nodeType === 1 ? n : n.parentElement);
          const name = el ? el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).join(".") : "") : "?";
          return name + " " + JSON.stringify([Math.round(s.previousRect.y), Math.round(s.currentRect.y), Math.round(s.previousRect.height), Math.round(s.currentRect.height)]);
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
`;

type Finding = { rule: string; detail: string; warn?: boolean };

/** Runs in the page. Returns the typography, target-size, chart and redundancy findings. */
function lint(f: Record<string, number>): { findings: Finding[]; metrics: Record<string, number> } {
  const out: { rule: string; detail: string; warn?: boolean }[] = [];
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  const name = (el: Element) => {
    const c = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    const t = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${c} "${t}"`;
  };
  const canvas = document.createElement("canvas").getContext("2d")!;

  /* Typography: running text is a p, li, dd or blockquote of two lines or more. */
  const SECONDARY = ".kc-note, figcaption, caption, .kc-legal, .kc-footnotes, .kc-disclaimer, .kc-fig, .kc-sheet__foot, .kc-sheet__head, .kc-slide, .kc-mast, nav, table, small, .kc-docmeta, .kc-flow, .kc-phases, .kc-address, .kc-legend, .kc-eyebrow, .kc-callout__label, .kc-footer, .kc-keydata, .kc-hint, .kc-error, .kc-field, .pg-src, pre";
  for (const el of document.querySelectorAll("p, li, dd, blockquote")) {
    if (!visible(el) || el.closest("svg, [aria-hidden=true]")) continue;
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text.length < 40) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === "normal" ? size * 1.2 : parseFloat(cs.lineHeight);
    const lines = Math.round((el.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh);
    if (lines < 2) continue;
    const secondary = !!el.closest(SECONDARY);
    canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const avg = canvas.measureText(text).width / text.length;
    const width = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const cpl = width / avg;
    if (size < f.runningTextPx) out.push({ rule: "type.size", detail: `${size}px < ${f.runningTextPx}px: ${name(el)}`, warn: secondary });
    if (lh / size < f.lineHeight - 1e-6) out.push({ rule: "type.line-height", detail: `${(lh / size).toFixed(2)} < ${f.lineHeight}: ${name(el)}` });
    if (cpl <= f.minCharsPerLine) out.push({ rule: "type.measure", detail: `${cpl.toFixed(1)} cpl, not more than ${f.minCharsPerLine}: ${name(el)}` });
  }

  /* Target size, WCAG 2.2 SC 2.5.8. */
  const T = f.targetPx;
  const targets: { el: Element; r: DOMRect }[] = [];
  for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab]")) {
    let r = el.getBoundingClientRect();
    if (el.matches("input[type=radio], input[type=checkbox]") && (r.width <= 1 || r.height <= 1 || getComputedStyle(el).opacity === "0")) {
      const label = (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest("label");
      if (!label) continue;
      r = label.getBoundingClientRect();
    }
    if (r.width === 0 || r.height === 0 || !visible(el)) continue;
    targets.push({ el, r });
  }
  const centre = (r: DOMRect) => [r.left + r.width / 2, r.top + r.height / 2];
  const small = targets.filter((t) => t.r.width < T - 0.01 || t.r.height < T - 0.01);
  for (const t of small) {
    // Inline exception: a link in a sentence, or sized by the line height of the text around it.
    const parent = t.el.parentElement;
    const inline = getComputedStyle(t.el).display === "inline" && parent && (parent.textContent ?? "").trim().length > (t.el.textContent ?? "").trim().length;
    if (inline) continue;
    // Spacing exception: a 24 px circle on the target's centre meets no other target and no other such circle.
    const [cx, cy] = centre(t.r);
    const clash = targets.some((o) => {
      if (o === t) return false;
      const ox = Math.max(o.r.left, Math.min(cx, o.r.right)), oy = Math.max(o.r.top, Math.min(cy, o.r.bottom));
      if (Math.hypot(cx - ox, cy - oy) < T / 2) return true;
      if (small.includes(o)) {
        const [dx, dy] = centre(o.r);
        return Math.hypot(cx - dx, cy - dy) < T;
      }
      return false;
    });
    if (clash) out.push({ rule: "target.2.5.8", detail: `${t.r.width.toFixed(0)}x${t.r.height.toFixed(0)} px: ${name(t.el)}` });
  }

  /* Charts: value axis length and gridline spacing in CSS px, as rendered. */
  for (const svg of document.querySelectorAll("svg[role=img]:not(.kc-spark)")) {
    if (!visible(svg)) continue;
    const vb = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
    if (vb.length !== 4) continue;
    const r = svg.getBoundingClientRect();
    const sx = r.width / vb[2], sy = r.height / vb[3];
    const lines = [...svg.querySelectorAll("line.kc-c-grid, line.kc-c-axis")].map((l) => ["x1", "y1", "x2", "y2"].map((a) => Number(l.getAttribute(a))));
    const h = [...new Set(lines.filter(([, y1, , y2]) => y1 === y2).map(([, y]) => y))].sort((a, b) => a - b);
    const v = [...new Set(lines.filter(([x1, , x2]) => x1 === x2).map(([x]) => x))].sort((a, b) => a - b);
    const [pos, s] = h.length >= 2 ? [h, sy] : v.length >= 2 ? [v, sx] : [[], 1];
    if (pos.length < 2) continue;
    const extent = (pos[pos.length - 1] - pos[0]) * s;
    const gap = Math.min(...pos.slice(1).map((p, i) => p - pos[i])) * s;
    const label = (svg.getAttribute("aria-label") ?? "").slice(0, 50);
    if (extent < f.chartValueAxisPx - 0.5) out.push({ rule: "chart.value-axis", detail: `${extent.toFixed(0)} px < ${f.chartValueAxisPx}: "${label}"` });
    if (gap < f.gridGapPx - 0.01) out.push({ rule: "chart.grid-gap", detail: `${gap.toFixed(1)} px < ${f.gridGapPx}: "${label}"` });
  }

  /* Colour never alone (WCAG 2.2 SC 1.4.1). */
  // A change chip in the up or down colour states its side in text: a sign (+ or U+2212) or a word.
  const sideInText = /[+\u2212]|[A-Za-z]{2,}/;
  for (const el of document.querySelectorAll(".kc-diff--up, .kc-diff--down")) {
    if (!sideInText.test(el.textContent ?? "")) out.push({ rule: "colour.redundancy", detail: `diff chip in up/down colour without a sign or word: ${name(el)}` });
  }
  for (const el of document.querySelectorAll(".kc-pill")) {
    if (!(el.textContent ?? "").trim()) out.push({ rule: "colour.redundancy", detail: `pill without a word: ${name(el)}` });
  }
  for (const el of document.querySelectorAll("rect.kc-c-up, rect.kc-c-down")) {
    const t = el.querySelector("title")?.textContent ?? "";
    if (!/[+\u2212]/.test(t)) out.push({ rule: "colour.redundancy", detail: `up/down mark without a signed value in its title: "${t}"` });
  }
  for (const svg of document.querySelectorAll("svg")) {
    const cells = svg.querySelectorAll("rect[class*='kc-c-div-'], rect[class*='kc-c-seq-']").length;
    const values = svg.querySelectorAll("text.kc-c-cell").length;
    if (cells && values < cells) out.push({ rule: "colour.redundancy", detail: `heatmap prints ${values} of ${cells} cell values: "${svg.getAttribute("aria-label")}"` });
  }
  /* The embedded EB Garamond face is in use (a page that silently fell back would pass the shift test). */
  if (document.querySelector(".kc-title, .kc-h2, .kc-lede") && ![...document.fonts].some((x) => x.family.replace(/["']/g, "") === "EB Garamond" && x.status === "loaded")) {
    out.push({ rule: "font.embedded", detail: "EB Garamond is not loaded after a fast load: check <FontPreload /> or the preload link" });
  }

  /* Reflow, WCAG 2.2 SC 1.4.10: no horizontal page scroll (wide tables and charts scroll in their own wrapper). */
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
    out.push({ rule: "layout.reflow", detail: `page is ${document.documentElement.scrollWidth} px wide in a ${document.documentElement.clientWidth} px viewport` });
  }

  /* Space reserved for media: images have width and height (or an aspect ratio); chart SVGs have a viewBox. */
  for (const img of document.querySelectorAll("img")) {
    const ok = (img.hasAttribute("width") && img.hasAttribute("height")) || getComputedStyle(img).aspectRatio !== "auto";
    if (!ok) out.push({ rule: "layout.media-size", detail: `img without width and height: ${(img.getAttribute("src") ?? "").slice(0, 60)}` });
  }
  for (const svg of document.querySelectorAll("svg[role=img]")) {
    if (!svg.getAttribute("viewBox") && !(svg.hasAttribute("width") && svg.hasAttribute("height"))) out.push({ rule: "layout.media-size", detail: `svg without viewBox or size: ${name(svg)}` });
  }
  /* Complexity budget (tokens.json -> budget; docs/evidence.md, "Simplicity"). Counted per page, as rendered:
     distinct font sizes, distinct non-neutral colours (a heatmap ramp counts once), nesting of bordered boxes,
     non-control elements with both a border and a background, and words in the longest heading. A specimen
     ([data-kc-specimen]: a block that shows the scale or the palette on purpose) is not counted. A sheet or a slide
     is the page itself, not a box. Over f["budget.<k>"] fails; at or over f["budget.<k>.warn"] warns. */
  const SKIP = "[data-kc-specimen], .kc-skip, .kc-visually-hidden, script, style, title, desc";
  const CONTROL = "input, select, textarea, button, a, label, summary, .kc-pill, .kc-diff, .kc-affix, .kc-seg__option span, .kc-sheet, .kc-slide";
  const RAMP = "[class*='kc-c-div-'], [class*='kc-c-seq-'], .kc-scale";
  const counted = (el: Element) => !el.closest(SKIP) && visible(el);
  const ownText = (el: Element) => [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim());
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const rgba = (c: string) => {
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = "rgba(0,0,0,0)";
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    return px.getImageData(0, 0, 1, 1).data;
  };
  const shown = (c: string) => rgba(c)[3] >= 26; // alpha >= 0.1
  const cache = new Map<string, string | null>();
  /** "#rrggbb" if the colour is visible (alpha >= 0.1) and not neutral (OKLab chroma >= 0.04), else null. */
  const accent = (c: string): string | null => {
    if (!cache.has(c)) {
      const [r, g, b, al] = rgba(c);
      const lin = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const [R, G, B] = [lin(r), lin(g), lin(b)];
      const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
      const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
      const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
      const chroma = Math.hypot(1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s);
      cache.set(c, al < 26 || chroma < 0.04 ? null : "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""));
    }
    return cache.get(c)!;
  };
  const SIDES = ["Top", "Right", "Bottom", "Left"] as const;
  const side = (cs: CSSStyleDeclaration, sd: (typeof SIDES)[number]) => parseFloat(cs[`border${sd}Width`]) > 0 && cs[`border${sd}Style`] !== "none" && shown(cs[`border${sd}Color`]);
  /** A bordered box: a block (not a control, not inline, not SVG) with a visible border on all four sides. */
  const isBox = (el: Element, cs: CSSStyleDeclaration) =>
    !el.matches(CONTROL) && !cs.display.startsWith("inline") && cs.display !== "contents" && !el.closest("svg") && SIDES.every((sd) => side(cs, sd));
  const sizes = new Set<number>();
  const colours = new Set<string>();
  let depth = 0, boxed = 0, words = 0, deepest = "", boxedName = "", wordiest = "";
  for (const el of document.body.querySelectorAll("*")) {
    if (!counted(el)) continue;
    const cs = getComputedStyle(el);
    const svgEl = !!el.closest("svg");
    if (ownText(el)) {
      sizes.add(Math.round(parseFloat(cs.fontSize) * 2) / 2);
      const a = accent(cs.color);
      if (a) colours.add(a);
    }
    if (el.closest(RAMP)) colours.add("one heatmap ramp");
    else if (svgEl) {
      for (const c of [cs.fill, cs.stroke]) {
        const a = accent(c);
        if (a) colours.add(a);
      }
    } else {
      const bg = accent(cs.backgroundColor);
      if (bg) colours.add(bg);
      for (const sd of SIDES) {
        const a = side(cs, sd) && accent(cs[`border${sd}Color`]);
        if (a) colours.add(a);
      }
      if (isBox(el, cs)) {
        let d = 0;
        for (let p: Element | null = el; p && p !== document.body; p = p.parentElement) if (isBox(p, getComputedStyle(p))) d++;
        if (d > depth) [depth, deepest] = [d, name(el)];
      }
      if (!el.matches(CONTROL) && SIDES.some((sd) => side(cs, sd)) && shown(cs.backgroundColor)) {
        boxed++;
        if (boxed <= 3) boxedName += (boxedName ? "; " : "") + name(el);
      }
    }
    if (el.matches("h1, h2, h3, h4, h5, h6, [role=heading]")) {
      const w = (el.textContent ?? "").trim().split(/\s+/).filter(Boolean).length;
      if (w > words) [words, wordiest] = [w, name(el)];
    }
  }
  const metrics: Record<string, [number, string]> = {
    fontSizes: [sizes.size, [...sizes].sort((a, b) => a - b).join(", ") + " px"],
    accentColours: [colours.size, [...colours].join(", ")],
    boxDepth: [depth, deepest],
    borderAndBackground: [boxed, boxedName],
    headingWords: [words, wordiest],
  };
  for (const [k, [v, where]] of Object.entries(metrics)) {
    const limit = f[`budget.${k}`];
    if (limit === undefined) continue;
    const warn = f[`budget.${k}.warn`];
    if (v > limit) out.push({ rule: `budget.${k}`, detail: `${v} > ${limit}: ${where}` });
    else if (warn !== undefined && v >= warn) out.push({ rule: `budget.${k}`, detail: `${v}, near the limit of ${limit}: ${where}`, warn: true });
  }
  return { findings: out, metrics: Object.fromEntries(Object.entries(metrics).map(([k, [v]]) => [k, v])) };
}

/* ---------- Run ---------- */

type Result = { page: string; viewport: string; scenario: Scenario; shift: number; shifts: { value: number; t: number; sources: string[] }[]; findings: Finding[]; metrics: Record<string, number> };

async function measure(browser: Browser, url: string, label: string, viewport: { name: string; width: number; height: number }, scenario: Scenario): Promise<Result> {
  const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.addInitScript(OBSERVE);
  await route(page, scenario);
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(scenario === "fonts-delayed" ? FONT_DELAY + 500 : 500);
  const shifts = (await page.evaluate("window.__shifts")) as Result["shifts"];
  const { findings, metrics } = scenario === "fonts-ready" ? await page.evaluate(lint, limits) : { findings: [], metrics: {} };
  await ctx.close();
  return { page: label, viewport: viewport.name, scenario, shift: shifts.reduce((s, e) => s + e.value, 0), shifts, findings, metrics };
}

async function main() {
  const [nextPort, staticPort] = [await freePort(), await freePort()];
  const next = await startNext(nextPort);
  const server = await staticServer(staticPort);
  const staticBase = `http://localhost:${staticPort}`;
  const browser = await chromium.launch();
  try {
    const appDir = join(root, "apps/playground/app");
    const routes = ["/", "/tokens", "/colour", "/components", "/brand", "/templates", "/examples/dashboard", "/examples/proposal", "/examples/mero-quote"];
    const sheets = readdirSync(join(appDir, "(sheet)/templates")).map((d) => `/templates/${d}`);
    const files = ["html/starter.html", "showcase/index.html", ...readdirSync(join(root, "html/templates")).filter((f) => f.endsWith(".html")).map((f) => `html/templates/${f}`)];
    const pages = [
      ...[...routes, ...sheets].map((r) => ({ url: `http://localhost:${nextPort}${r}`, label: `playground ${r}` })),
      ...files.map((f) => ({ url: `${staticBase}/${f}`, label: f })),
    ];
    const viewports = [
      { name: "desktop", width: 1280, height: 900 },
      { name: "phone", width: 320, height: 720 },
    ];
    const scenarios: Scenario[] = ["fonts-ready", "fonts-delayed", "fonts-blocked"];
    const jobs = pages.flatMap((p) => viewports.flatMap((v) => scenarios.map((s) => () => measure(browser, p.url, p.label, v, s))));
    // Self-test: every rule must fire on the fixture, or the gate itself is broken.
    const RULES = ["layout-shift", "type.size", "type.line-height", "type.measure", "target.2.5.8", "chart.value-axis", "chart.grid-gap", "colour.redundancy", "font.embedded", "layout.media-size", "layout.reflow", ...Object.keys(raw.budget).filter((k) => !k.startsWith("$")).map((k) => `budget.${k}`)];
    const fixture = `${staticBase}/scripts/fixtures/gate-violations.html`;
    const selfTest = await measure(browser, fixture, "fixture", viewports[0], "fonts-ready");
    const fired = new Set([...selfTest.findings.map((f) => f.rule), ...(selfTest.shift > 0 ? ["layout-shift"] : [])]);
    const silent = RULES.filter((r) => !fired.has(r));
    if (silent.length) {
      console.error(`FAIL gate self-test: these rules did not fire on scripts/fixtures/gate-violations.html: ${silent.join(", ")}`);
      process.exitCode = 1;
    }
    const results: Result[] = [];
    const queue = [...jobs];
    await Promise.all(
      Array.from({ length: 8 }, async () => {
        for (let job = queue.shift(); job; job = queue.shift()) results.push(await job());
      }),
    );

    let failures = 0, warnings = 0;
    const byRule = new Map<string, number>();
    for (const r of results.sort((a, b) => (a.page + a.viewport + a.scenario).localeCompare(b.page + b.viewport + b.scenario))) {
      if (r.shift > 0) {
        failures++;
        byRule.set("layout-shift", (byRule.get("layout-shift") ?? 0) + 1);
        console.error(`FAIL layout-shift ${r.page} [${r.viewport}, ${r.scenario}]: total ${r.shift.toFixed(4)} in ${r.shifts.length} shift(s)`);
        for (const s of r.shifts.slice(0, 3)) console.error(`     ${s.value.toFixed(4)} at ${s.t} ms: ${s.sources.slice(0, 3).join("; ")}`);
      }
      const seen = new Set<string>();
      for (const f of r.findings) {
        const key = f.rule + f.detail;
        if (seen.has(key)) continue;
        seen.add(key);
        byRule.set(f.rule + (f.warn ? " (warn)" : ""), (byRule.get(f.rule + (f.warn ? " (warn)" : "")) ?? 0) + 1);
        if (f.warn) {
          warnings++;
          if (verbose) console.log(`warn ${f.rule} ${r.page} [${r.viewport}]: ${f.detail}`);
        } else {
          failures++;
          console.error(`FAIL ${f.rule} ${r.page} [${r.viewport}]: ${f.detail}`);
        }
      }
    }
    if (showBudget) {
      const keys = Object.keys(raw.budget).filter((k) => !k.startsWith("$"));
      const rows = new Map<string, number[]>();
      for (const r of results) {
        if (r.scenario !== "fonts-ready") continue;
        const row = rows.get(r.page) ?? keys.map(() => 0);
        keys.forEach((k, i) => (row[i] = Math.max(row[i], r.metrics[k] ?? 0)));
        rows.set(r.page, row);
      }
      console.log(["page", ...keys].join("\t"));
      for (const [p, row] of [...rows].sort()) console.log([p, ...row].join("\t"));
    }
    const summary = [...byRule].map(([k, v]) => `${k} ${v}`).join(", ") || "none";
    console.log(`pages checked: ${pages.length} pages x ${viewports.length} viewports x ${scenarios.length} network conditions = ${results.length} loads; findings: ${summary}`);
    console.log(`gate self-test: ${RULES.length - silent.length} of ${RULES.length} rules fire on the fixture`);
    if (failures || silent.length) {
      console.error(`${failures} failure(s), ${warnings} warning(s). docs/evidence.md explains each rule; AGENTS.md says how to fix.`);
      process.exitCode = 1;
    } else console.log(`pages ok: no layout shift, typography floors, target sizes, chart sizes, colour redundancy and the complexity budget hold (${warnings} warning(s); --verbose lists them)`);
  } finally {
    await browser.close();
    server.close();
    next.kill();
  }
}

await main();
