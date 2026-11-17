import type { CSSProperties } from "react";
import { BRAND_COLORS, LOGOS, type LogoName } from "./brand-data";

export type LogoVariant = "auto" | "primary" | "ink" | "reversed-green" | "reversed-dark";

/**
 * A KC&C or mero logo, from the generated outlines (scripts/build-brand.ts). Never redraw or retype a logo.
 * "auto" follows the theme: ink on light paper, cream on dark paper; the mero mark stays heavy green.
 * Give `height` in px; the width follows. Respect the minimum sizes in DESIGN.md (section 16).
 */
export function Logo({ name, variant = "auto", height, title, style }: { name: LogoName; variant?: LogoVariant; height: number; title?: string; style?: CSSProperties }) {
  const l = LOGOS[name];
  const { ink, paper, green } = BRAND_COLORS;
  const colours: Record<LogoVariant, { fg: string; mark: string }> = {
    auto: { fg: "var(--kc-ink)", mark: name.startsWith("mero") ? "var(--kc-green-800)" : "var(--kc-ink)" },
    primary: { fg: ink, mark: name.startsWith("mero") ? green : ink },
    ink: { fg: ink, mark: ink },
    "reversed-green": { fg: paper, mark: paper },
    "reversed-dark": { fg: paper, mark: paper },
  };
  const c = colours[variant];
  const label = title ?? l.label;
  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} height={height} width={(height * l.w) / l.h} role="img" aria-label={label} style={{ display: "block", ...style }}>
      <title>{label}</title>
      {l.mark ? <path fill={c.mark} fillRule="evenodd" d={l.mark} /> : null}
      {l.fg ? <path fill={c.fg} fillRule="evenodd" d={l.fg} /> : null}
    </svg>
  );
}

export { BRAND_COLORS, LOGOS, type LogoName };
