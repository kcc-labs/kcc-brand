/*
 * PDF text gate: prints every single-file page (html/starter.html, html/templates/*.html, showcase/index.html) with
 * scripts/print-pdf.ts, extracts the text of the PDF with PDF.js (pdfjs-dist) and fails if a word of the page's
 * visible text is split in the PDF ("liq uidations", "Docu ment"). Copying, searching and screen readers use this
 * text, so a split word is a defect even when the page looks right.
 *
 * Measured cause (docs/evidence.md, "Static fonts in printed documents"): Chromium (Skia) writes text set in a
 * variable font (the variable EB Garamond; system-ui, which is SF Pro on macOS) or in a synthesised bold as Type 3
 * fonts: one drawing a glyph, placed one glyph at a time. Readers that rebuild words from glyph positions, such as
 * macOS PDFKit (Preview, copy and paste), split those words. Static fonts are embedded as TrueType (CIDFontType2)
 * runs and do not split. PDF.js itself joins Type 3 runs well, so the gate counts a word as not whole when PDF.js
 * finds it split, or only in a Type 3 run.
 *
 * Method: the page text is document.body.innerText in print media (what the PDF shows). Each word (2+ characters,
 * split on white space) must occur in the PDF text, with white space normalised to one space, at least as many
 * times as it occurs in the page text (Type 3 runs left out). A line that ends in a hyphen is joined to the next line both with and
 * without the hyphen, so a break at a real hyphen ("risk-parameter") and a hyphen the page itself adds when it
 * hyphenates ("liqui-dations") are not counted.
 *
 * Self-test: scripts/fixtures/pdf-variable-font.html sets text in a variable font. If no word splits there, the
 * gate cannot see the defect, and it fails.
 *
 *   node scripts/check-pdf-text.ts             run after `npm run build` (it reads html/templates/)
 *   node scripts/check-pdf-text.ts --verbose   list every split word
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { chromium, type Browser } from "playwright";
import { printPage } from "./print-pdf.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const verbose = process.argv.includes("--verbose");
const TYPES: Record<string, string> = { ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

type PdfText = { text: string; type3: string };

/**
 * Text of the PDF, one line per PDF.js line (an item with hasEOL ends a line). `text` has the runs set in embedded
 * TrueType or OpenType fonts; `type3` has the runs Chromium drew as Type 3 glyphs (a variable font, or a weight the
 * browser synthesised). A Type 3 run has no font program, so a reader rebuilds its words from glyph positions, and
 * macOS PDFKit (Preview) splits them (measured, docs/evidence.md). Words found only there count as not whole.
 */
async function pdfText(data: Buffer): Promise<PdfText> {
  const task = getDocument({ data: new Uint8Array(data), useSystemFonts: false, verbosity: 0 });
  const doc = await task.promise;
  const out: PdfText = { text: "", type3: "" };
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    await page.getOperatorList(); // loads the fonts into commonObjs
    const isType3 = new Map<string, boolean>();
    for (const item of content.items) {
      if (!("str" in item)) continue;
      if (!isType3.has(item.fontName)) {
        const font: unknown = page.commonObjs.has(item.fontName) ? page.commonObjs.get(item.fontName) : null;
        isType3.set(item.fontName, !!(font as { isType3Font?: boolean } | null)?.isType3Font);
      }
      const t3 = isType3.get(item.fontName)!;
      out[t3 ? "type3" : "text"] += item.str + (item.hasEOL ? "\n" : "");
      out[t3 ? "text" : "type3"] += item.hasEOL ? "\n" : " ";
    }
    out.text += "\n";
    out.type3 += "\n";
  }
  await task.destroy();
  return out;
}

const norm = (s: string) => s.replace(/\s+/g, " ");
const count = (hay: string, needle: string) => {
  let n = 0;
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) n++;
  return n;
};
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// A line ending in a hyphen: joined keeping the hyphen (a real hyphen) and dropping it (hyphenation by the page).
const keepHyphen = (s: string) => norm(s.replace(/([-\u2010\u00ad])\s*\n\s*/g, (_m, h: string) => (h === "\u00ad" ? "" : h)));
const dropHyphen = (s: string) => norm(s.replace(/[-\u2010\u00ad]\s*\n\s*/g, ""));

/** A word the PDF does not have whole. `split`: the PDF has it in pieces or only as Type 3 glyphs (fails).
 *  Otherwise the PDF does not have it at all, for example a label clipped by the print layout (warns). */
type Split = { word: string; missing: number; seen: string; split: boolean };

/** Words of the page text that the PDF does not have whole. */
function splitWords(dom: string, pdf: PdfText): Split[] {
  const page = norm(dom);
  const keep = keepHyphen(pdf.text), drop = dropHyphen(pdf.text), t3 = keepHyphen(pdf.type3);
  const words = new Set(page.split(" ").filter((w) => [...w].length >= 2));
  const out: Split[] = [];
  for (const w of words) {
    const missing = count(page, w) - Math.max(count(keep, w), count(drop, w));
    if (missing <= 0) continue;
    // Show how the PDF has it: the same characters with white space between them, or the Type 3 run.
    const m = pdf.text.match(new RegExp([...w].map(escape).join("\\s*")));
    const seen = t3.includes(w) ? `${w} (Type 3)` : m && /\s/.test(m[0]) ? m[0].replace(/\s+/g, "|") : `${w} (missing)`;
    out.push({ word: w, missing, seen, split: !seen.endsWith("(missing)") });
  }
  return out;
}

async function check(browser: Browser, file: string): Promise<{ file: string; words: number; splits: Split[] }> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // Templates point their logos at https://example.com/brand/; serve them from the repository, and send nothing else
  // off the machine.
  await page.route(/^https?:\/\//, async (r) => {
    const url = new URL(r.request().url());
    const local = join(root, url.pathname);
    if (url.hostname === "example.com" && url.pathname.startsWith("/brand/") && existsSync(local)) {
      return r.fulfill({ status: 200, contentType: TYPES[extname(local)] ?? "application/octet-stream", body: readFileSync(local) });
    }
    return r.abort();
  });
  const pdf = await printPage(page, pathToFileURL(join(root, file)).href);
  const dom = await page.evaluate(() => {
    // A superscript or subscript sits on its own baseline, so the PDF has it as its own run: "week." and "1".
    for (const el of document.querySelectorAll("sup, sub")) el.before(" ");
    return document.body.innerText;
  });
  await ctx.close();
  return { file, words: norm(dom).trim().split(" ").length, splits: splitWords(dom, await pdfText(pdf)) };
}

const fmt = (s: Split[]) => s.map((x) => `"${x.seen}"${x.missing > 1 ? ` x${x.missing}` : ""}`);
const sum = (s: Split[]) => s.reduce((n, x) => n + x.missing, 0);
const show = (s: Split[]) => {
  const list = fmt(s);
  return (verbose ? list : list.slice(0, 8)).join(", ") + (!verbose && list.length > 8 ? ", …" : "");
};

const browser = await chromium.launch();
try {
  const files = ["html/starter.html", "showcase/index.html", ...readdirSync(join(root, "html/templates")).filter((f) => f.endsWith(".html")).map((f) => `html/templates/${f}`)];
  const fixture = await check(browser, "scripts/fixtures/pdf-variable-font.html");
  const results = await Promise.all(files.map((f) => check(browser, f)));
  let total = 0, warnings = 0;
  for (const r of results) {
    const split = r.splits.filter((x) => x.split), absent = r.splits.filter((x) => !x.split);
    total += sum(split);
    warnings += sum(absent);
    if (split.length) console.error(`FAIL pdf.text ${r.file}: ${sum(split)} split word(s) of ${r.words}: ${show(split)}`);
    if (absent.length && verbose) console.log(`warn pdf.text ${r.file}: ${sum(absent)} word(s) not in the PDF (clipped in print?): ${show(absent)}`);
  }
  const fixtureSplit = fixture.splits.filter((x) => x.split);
  const fired = fixtureSplit.length > 0;
  console.log(`gate self-test: ${fired ? `${sum(fixtureSplit)} split word(s) found` : "NO split word found"} on the variable-font fixture${fired ? ` (${fmt(fixtureSplit).slice(0, 3).join(", ")}, …)` : ""}`);
  if (!fired) console.error("FAIL gate self-test: scripts/fixtures/pdf-variable-font.html printed without a split word; the PDF text gate cannot see the defect");
  console.log(`pdf text: ${files.length} pages printed, ${total} split word(s), ${warnings} word(s) not in the PDF (warnings; --verbose lists them)`);
  if (total || !fired) {
    console.error("Printed documents use static fonts only (AGENTS.md; docs/evidence.md, static fonts in printed documents).");
    process.exitCode = 1;
  } else console.log("pdf text ok: every word of every page is whole in its PDF");
} finally {
  await browser.close();
}
