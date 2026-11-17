import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { BRAND_COLORS, DataTable, LOGOS as LOGO_DATA, Logo, Note, PageTitle, Pill, Section, type LogoName, type LogoVariant } from "@kcc/design";

export const metadata: Metadata = { title: "Brand" };

const LOGOS: { name: LogoName; title: string }[] = [
  { name: "kcc-lockup", title: "KC&C lockup" },
  { name: "kcc-wordmark", title: "KC&C wordmark" },
  { name: "kcc-monogram", title: "KC&C monogram" },
  { name: "kcc-icon", title: "KC&C icon" },
  { name: "mero-lockup", title: "mero lockup" },
  { name: "mero-wordmark", title: "mero wordmark" },
  { name: "mero-mark", title: "mero mark" },
];
const VARIANTS: { v: LogoVariant; bg: string; label: string }[] = [
  { v: "primary", bg: BRAND_COLORS.paper, label: "Primary, on paper" },
  { v: "ink", bg: "#FFFFFF", label: "One colour, ink" },
  { v: "reversed-green", bg: BRAND_COLORS.green, label: "Reversed, on green" },
  { v: "reversed-dark", bg: BRAND_COLORS.darkPaper, label: "Reversed, on dark paper" },
];

const tile: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", padding: 21, minHeight: 110 };

function Rule({ ok, children, label }: { ok: boolean; children: ReactNode; label: string }) {
  return (
    <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ ...tile, background: BRAND_COLORS.paper, overflow: "hidden" }}>{children}</div>
      <figcaption className="kc-note" style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <Pill tone={ok ? "up" : "down"}>{ok ? "Do" : "Don't"}</Pill> {label}
      </figcaption>
    </figure>
  );
}

export default function Brand() {
  return (
    <>
      <PageTitle
        title="Brand"
        lede="Institutional, not promotional: EB Garamond capitals, ink on paper, one heavy green. The logos are built from type outlines on the token grid by a script; use the files or the Logo component, never redraw them."
      />

      <Section id="b-logos" eyebrow="Logos, four variants each" title="Two names, one construction">
        {LOGOS.map((l) => (
          <div key={l.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 className="kc-h3">{l.title}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {VARIANTS.map((v) => (
                <figure key={v.v} style={{ margin: 0 }}>
                  <div style={{ ...tile, background: v.bg }}>
                    <Logo name={l.name} variant={v.v} height={l.name.includes("wordmark") ? 34 : 55} />
                  </div>
                  <figcaption className="kc-hint" style={{ paddingTop: 5 }}>
                    {v.label} · <code>brand/logos/{l.name}-{v.v}.svg</code>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section id="b-construction" eyebrow="Construction, logo units" title="An 89 square, a 34 cap height: phi squared apart">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 34 }}>
          <Construction name="kcc-monogram" band={[27.5, 61.5]} note="Square F(11) = 89. Frame 2, inner rule 1 at inset 5. KC at cap height F(9) = 34 = 89 / phi squared, centred." />
          <Construction name="mero-mark" band={[27.5, 61.5]} note="Square 89. Lowercase m at x-height 34 = 89 / phi squared, knocked out, centred." />
          <Construction name="kcc-lockup" band={null} note="Wordmark at cap 34, tracking 0.04 em. Rule 1 at 13 (s3) under it. Descriptor at cap 34 / phi cubed = 8, tracking 0.12 em, 13 under the rule." />
        </div>
      </Section>

      <Section id="b-space" eyebrow="Clear space and minimum size" title="Keep 21 units clear on every side">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 34, alignItems: "center" }}>
          <div style={{ padding: 21 * 0.6, outline: "1px dashed var(--kc-control)", outlineOffset: 0, display: "inline-block" }}>
            <Logo name="kcc-lockup" height={71 * 0.6} />
          </div>
          <p className="kc-note">Clear space is s4 (21 units), the gap a section gives its heading, scaled with the logo. Nothing enters it: no text, rule or edge.</p>
        </div>
        <DataTable
          label="Minimum sizes"
          rows={[
            ["KC&C lockup", "55 px high", "18 mm high", "The descriptor must stay readable"],
            ["KC&C wordmark", "13 px cap (16 px high)", "4 mm cap", ""],
            ["KC&C monogram", "24 px", "8 mm", "Below this use the icon"],
            ["KC&C icon, mero mark", "16 px", "5 mm", "Favicon size"],
            ["mero lockup", "34 px high", "10 mm high", ""],
          ]}
          rowKey={(r) => r[0]}
          rowHeader={(r) => r[0]}
          rowHeaderLabel="Logo"
          columns={[
            { header: "Screen", cell: (r) => r[1] },
            { header: "Print", cell: (r) => r[2] },
            { header: "Note", text: true, cell: (r) => r[3] },
          ]}
        />
      </Section>

      <Section id="b-icons" eyebrow="Favicon and app icons, PNG and ICO" title="16 to 512 px, with a maskable version">
        {(["kcc", "mero"] as const).map((b) => (
          <div key={b} style={{ display: "flex", flexWrap: "wrap", gap: 21, alignItems: "end" }}>
            {[16, 32, 48, 180, 192].map((s) => (
              <figure key={s} style={{ margin: 0, textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- showing the exact PNG files */}
                <img src={`/brand/${b}/${s === 180 ? "apple-touch-icon" : `icon-${s}`}.png`} width={Math.min(s, 96)} height={Math.min(s, 96)} alt={`${b} icon ${s} px`} />
                <figcaption className="kc-hint">{s}</figcaption>
              </figure>
            ))}
            <figure style={{ margin: 0, textAlign: "center", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- showing the exact PNG file */}
              <img src={`/brand/${b}/maskable-512.png`} width={96} height={96} alt={`${b} maskable icon`} style={{ borderRadius: "50%" }} />
              <figcaption className="kc-hint">maskable, cropped to a circle</figcaption>
            </figure>
          </div>
        ))}
        <Note>Files in brand/icons/kcc and brand/icons/mero: favicon.svg, favicon.ico (16, 32, 48), apple-touch-icon.png (180), icon-192.png, icon-512.png, maskable-512.png (artwork in the central 80%), site.webmanifest.</Note>
      </Section>

      <Section id="b-og" eyebrow="Social card, 1200 × 630" title="Paper, a rule, the finding as the title">
        {/* eslint-disable-next-line @next/next/no-img-element -- the rendered sample */}
        <img src="/brand/og-sample.png" width={600} height={315} alt="Sample social card: KC&C monogram, Market note, CC order-book depth fell 2% in a week, 17 Nov 2026" style={{ maxWidth: "100%", height: "auto", border: "1px solid var(--kc-hair)" }} />
        <Note>Template: brand/og/og-card.html. Edit the eyebrow, the title (a finding, under 60 characters) and the date; render with scripts/render-icons.ts.</Note>
      </Section>

      <Section id="b-rules" eyebrow="Use" title="Do and don't">
        <div data-kc-specimen style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 21 }}>
          <Rule ok label="Use the file or the Logo component, at a listed size.">
            <Logo name="kcc-lockup" height={55} variant="primary" />
          </Rule>
          <Rule ok label="Reverse to paper on the heavy green or dark paper only.">
            <div style={{ background: BRAND_COLORS.green, padding: 13 }}>
              <Logo name="mero-lockup" height={34} variant="reversed-green" title="mero lockup at its minimum size" />
            </div>
          </Rule>
          <Rule ok={false} label="Do not stretch, squeeze or rotate.">
            <Logo name="kcc-wordmark" height={34} variant="primary" style={{ transform: "scaleX(1.5) rotate(-8deg)" }} />
          </Rule>
          <Rule ok={false} label="Do not add glows, shadows or gradients.">
            <Logo name="kcc-wordmark" height={34} variant="primary" style={{ filter: "drop-shadow(0 0 6px #22ff88) drop-shadow(0 0 12px #22ff88)" }} />
          </Rule>
          <Rule ok={false} label="Do not recolour, and never in neon.">
            <span style={{ filter: "invert(1) sepia(1) saturate(30) hue-rotate(250deg)" }}>
              <Logo name="mero-mark" height={55} variant="primary" />
            </span>
          </Rule>
          <Rule ok={false} label="Do not retype the name in another font.">
            <span style={{ font: "800 34px/1 Arial, sans-serif", letterSpacing: "-0.04em" }}>KC&amp;C</span>
          </Rule>
          <Rule ok={false} label="Do not put a mark in a circle or a coin.">
            <span style={{ display: "inline-flex", padding: 13, borderRadius: "50%", border: "3px solid #c9a227" }}>
              <Logo name="kcc-icon" height={34} variant="primary" />
            </span>
          </Rule>
          <Rule ok={false} label="Do not place on a busy or low-contrast background.">
            <div style={{ background: "repeating-linear-gradient(45deg, #9a968a 0 6px, #b8b3a5 6px 12px)", padding: 13 }}>
              <Logo name="kcc-wordmark" height={34} variant="ink" />
            </div>
          </Rule>
        </div>
      </Section>
    </>
  );
}

/** A logo at 3x with its construction lines drawn over it, in logo units. */
function Construction({ name, band, note }: { name: LogoName; band: [number, number] | null; note: string }) {
  const scale = 3;
  const { w, h } = LOGO_DATA[name];
  return (
    <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8, maxWidth: 520, overflowX: "auto" }}>
      <div style={{ position: "relative", display: "inline-block", alignSelf: "start" }}>
        <Logo name={name} height={h * scale} variant="primary" />
        <svg viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
          {band ? (
            <g style={{ stroke: "var(--kc-down)" }} strokeWidth={0.3} fill="none">
              <line x1={-4} x2={93} y1={band[0]} y2={band[0]} />
              <line x1={-4} x2={93} y1={band[1]} y2={band[1]} />
              <line x1={44.5} x2={44.5} y1={-4} y2={93} strokeDasharray="1 1" />
            </g>
          ) : (
            <g style={{ stroke: "var(--kc-down)" }} strokeWidth={0.3} fill="none">
              <line x1={-4} x2={w + 4} y1={35.46} y2={35.46} />
              <line x1={-4} x2={w + 4} y1={48.46} y2={48.46} strokeDasharray="1 1" />
              <line x1={-4} x2={w + 4} y1={h - 8} y2={h - 8} strokeDasharray="1 1" />
            </g>
          )}
        </svg>
      </div>
      <figcaption className="kc-note">{note}</figcaption>
    </figure>
  );
}
