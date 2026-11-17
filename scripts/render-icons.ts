/*
 * Renders the icon PNGs, favicon.ico and the OG sample image with headless Chrome. Run after `npm run brand`
 * when the marks change; the outputs are committed, so builds do not need Chrome.
 *
 *   CHROME=/path/to/chrome node scripts/render-icons.ts
 *
 * Sizes: 16, 32, 48 (favicon.ico), 180 (apple-touch-icon), 192, 512, and maskable 512 (artwork in the central 80%).
 */
import { execFileSync } from "node:child_process";
import { cpSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const tmp = mkdtempSync(join(tmpdir(), "kcc-icons-"));

function shot(url: string, w: number, h: number, out: string) {
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", `--window-size=${w},${h}`, `--screenshot=${out}`, url], { stdio: "ignore" });
}

/** Resizes a PNG with the PNG encoder in Chrome: draws the 512 source into a canvas of the target size. */
function resize(src: string, size: number, out: string) {
  const html = join(tmp, `r${size}.html`);
  writeFileSync(html, `<body style="margin:0"><img src="file://${src}" style="width:${size}px;height:${size}px;display:block;image-rendering:auto">`);
  shot(`file://${html}`, size, size, out);
}

/** favicon.ico holding PNG images (allowed since Windows Vista; all current browsers read it). */
function ico(pngs: string[], out: string) {
  const data = pngs.map((p) => readFileSync(p));
  const head = Buffer.alloc(6 + 16 * data.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(data.length, 4);
  let offset = head.length;
  data.forEach((d, i) => {
    const size = d.readUInt32BE(16); // PNG IHDR width
    const e = 6 + i * 16;
    head.writeUInt8(size >= 256 ? 0 : size, e); head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(d.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += d.length;
  });
  writeFileSync(out, Buffer.concat([head, ...data]));
}

for (const brand of ["kcc", "mero"]) {
  const dir = join(root, "brand/icons", brand);
  const big = join(dir, "icon-512.png");
  shot(`file://${join(dir, "favicon.svg")}`, 512, 512, big);
  shot(`file://${join(dir, "maskable.svg")}`, 512, 512, join(dir, "maskable-512.png"));
  for (const s of [16, 32, 48, 180, 192]) resize(big, s, join(dir, s === 180 ? "apple-touch-icon.png" : `icon-${s}.png`));
  ico([16, 32, 48].map((s) => join(dir, `icon-${s}.png`)), join(dir, "favicon.ico"));
  console.log(`rendered brand/icons/${brand}`);
}
shot(`file://${join(root, "brand/og/og-card.html")}`, 1200, 630, join(root, "brand/og/og-sample.png"));
console.log("rendered brand/og/og-sample.png");

// The playground serves the icons and the card from public/brand (favicons, manifest, Brand page).
const pub = join(root, "apps/playground/public/brand");
cpSync(join(root, "brand/icons"), pub, { recursive: true });
cpSync(join(root, "brand/og/og-sample.png"), join(pub, "og-sample.png"));
console.log("copied icons and card to apps/playground/public/brand");
