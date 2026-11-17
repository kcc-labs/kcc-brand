import { ebGaramondLatin } from "./font-data";

/**
 * Preloads the embedded EB Garamond faces (font-embed.css), one static face a weight. Put it in the root layout's
 * <head>. A preloaded font is ready before the first paint, so the first frame is set in EB Garamond and text never
 * moves when the font arrives (docs/evidence.md, layout stability; scripts/check-pages.ts measures it).
 */
export function FontPreload() {
  return Object.values(ebGaramondLatin).map((href, i) => <link key={i} rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href={href} />);
}
