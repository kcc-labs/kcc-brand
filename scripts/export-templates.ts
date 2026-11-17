/*
 * Exports the document templates as standalone single-file HTML (html/templates/*.html) from the playground's
 * prerendered pages: scripts removed, Next's stylesheets replaced by the kit CSS inline (with EB Garamond latin
 * embedded, so the page needs no font request and text never swaps fonts), logo and icon paths made absolute to
 * the brand folder. Run after `next build` (npm run build does).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const built = join(root, "apps/playground/.next/server/app/templates");
const out = join(root, "html/templates");
if (!existsSync(built)) throw new Error("run next build first: no prerendered templates");
mkdirSync(out, { recursive: true });
const css = readFileSync(join(root, "html/kcc.css"), "utf8");

const pages = readdirSync(built).filter((f) => f.endsWith(".html"));
for (const f of pages) {
  let html = readFileSync(join(built, f), "utf8");
  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    // Keep the preload of the embedded font (<FontPreload />): it is what stops the first-paint font swap.
    .replace(/<link\b[^>]*(rel="(stylesheet|preload|modulepreload|expect)"|as="(script|font|style)")[^>]*\/?>/g, (m) => (m.includes('href="data:font/') ? m : ""))
    .replace(/<link\b[^>]*rel="(icon|apple-touch-icon|manifest)"[^>]*\/?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<template\b[\s\S]*?<\/template>/g, "")
    .replace(/<div hidden=""?>[\s\S]*?<\/div>/g, "")
    .replace(/ (src|href)="\/brand\//g, ' $1="https://example.com/brand/')
    .replace("</head>", `<style>\n/* KC&C kit, inline: html/kcc.css */\n${css}\n</style></head>`);
  const header = `<!-- KC&C template, exported from apps/playground by scripts/export-templates.ts. Edit the React page, not this file.\n     Replace https://example.com/brand/ with where you host brand/icons and brand/logos. -->\n`;
  writeFileSync(join(out, f), html.replace(/^<!DOCTYPE html>/i, `<!doctype html>\n${header}`));
}
console.log(`exported ${pages.length} templates to html/templates/: ${pages.join(", ")}`);
