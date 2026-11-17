/*
 * Compiles the Tailwind v4 preset with Tailwind itself and checks that KC&C utilities exist and Tailwind's defaults
 * (colours, shadows) are gone. Run by `npm run check`.
 */
import { compile } from "@tailwindcss/node";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "packages/design/tailwind");
const compiler = await compile(`@import "tailwindcss"; @import "./preset.css";`, { base, onDependency: () => {} });
const css = compiler.build(["bg-paper", "text-ink", "border-hair", "fill-cat-3", "font-serif", "text-read", "p-s3", "gap-s5", "rounded-small", "max-w-measure", "bg-red-500", "shadow-lg", "rounded-xl"]);

const want = [".bg-paper", ".text-ink", ".border-hair", ".fill-cat-3", ".font-serif", ".text-read", ".p-s3", ".gap-s5", ".rounded-small", ".max-w-measure"];
const gone = [".bg-red-500", ".shadow-lg", ".rounded-xl"];
const missing = want.filter((c) => !css.includes(c));
const present = gone.filter((c) => css.includes(c));
if (missing.length || present.length) {
  console.error(`tailwind preset: missing ${missing.join(", ") || "none"}; should not exist ${present.join(", ") || "none"}`);
  process.exit(1);
}
console.log(`tailwind preset ok: ${want.length} KC&C utilities built, Tailwind default colours, shadows and radii removed`);
