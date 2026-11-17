/**
 * Print a single-file HTML page to an A4 PDF with Playwright's Chromium.
 *
 *   node scripts/print-pdf.ts page.html out.pdf [--scale 0.8]
 *
 * Scale the whole page with the printer's `scale` option, never with CSS `zoom` or `transform`: CSS zoom gives
 * fractional box widths, so a border that sits on the right edge of the content area can be clipped by the page
 * margin (seen on the confidentiality mark and on the flow strip, 17 Nov 2026). The printer scale lays the page out
 * at width / scale and draws it smaller, so every box keeps whole-pixel edges inside the printable area.
 * `@page` (size, margins, margin boxes) from the page's own CSS is used. The body gets 2px of side padding in print, so a
 * 1px border on the edge of the content area is not half cut by the PDF clip (same day).
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--scale");
const [input, output] = pos;
if (!input || !output) {
  console.error("usage: node scripts/print-pdf.ts page.html out.pdf [--scale 0.8]");
  process.exit(2);
}
const si = args.indexOf("--scale");
const scale = si >= 0 ? Number(args[si + 1]) : 1;
if (!(scale >= 0.1 && scale <= 2)) {
  console.error("print-pdf: --scale must be between 0.1 and 2");
  process.exit(2);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  // A 1px border that ends exactly on the edge of the printable area is half cut by the PDF clip. Keep 2px inside.
  await page.addStyleTag({ content: "@media print { body { padding-inline: 2px !important; } }" });
  await page.pdf({ path: output, preferCSSPageSize: true, printBackground: true, scale });
  console.log(`print-pdf: ${output} (scale ${scale})`);
} finally {
  await browser.close();
}
