import type { Metadata } from "next";
import { DataTable, Note, PageTitle, Section, tokens } from "@kcc/design";
import { SampleCharts } from "@/components/SampleCharts";

export const metadata: Metadata = { title: "Colour" };

const { ramps, rampSteps, categorical, sequential, diverging, simulated, report } = tokens;
const VISIONS = ["normal", "protanopia", "deuteranopia", "tritanopia"] as const;
type Vision = (typeof VISIONS)[number];

function Chips({ colors, label }: { colors: readonly string[]; label: string }) {
  return (
    <div className="pg-chips" role="img" aria-label={label}>
      {colors.map((c, i) => (
        <i key={i} style={{ background: c }} title={c} />
      ))}
    </div>
  );
}

const scaleFor = (mode: "light" | "dark", v: Vision, which: "categorical" | "diverging") =>
  v === "normal" ? (which === "categorical" ? categorical[mode] : diverging[mode]) : simulated[mode][v][which];

export default function Colour() {
  const cvd = report.cvd;
  return (
    <>
      <PageTitle
        title="Colour"
        lede="Built in OKLCH, so equal steps look equal. A heavy dark green and a heavy dark red on cream paper, warm greys toward the paper's hue, and chart scales checked for contrast and for colour-blind readers."
      />

      <Section id="ramps" eyebrow="Tonal ramps, OKLCH, fixed lightness per step" title="Six ramps; the semantic colours are steps on them">
        <div className="pg-ramp">
          <span />
          {Object.keys(rampSteps).map((s) => (
            <small key={s}>{s}</small>
          ))}
          {Object.entries(ramps).map(([name, steps]) => (
            <Ramp key={name} name={name} steps={steps} />
          ))}
          <span>L</span>
          {Object.values(rampSteps).map((l, i) => (
            <small key={i}>{l}</small>
          ))}
        </div>
        <Note>Hover a step for its hex and OKLCH. Chroma eases off toward white and black so the ends do not glow; every step is mapped into sRGB by lowering chroma only.</Note>
      </Section>

      <Section id="cvd" eyebrow="Chart scales under colour-vision simulation (Machado 2009)" title="Eight categories stay apart; green and red need a second cue">
        <div className="pg-themes">
          {(["light", "dark"] as const).map((mode) => (
            <div data-theme={mode} key={mode}>
              <p className="kc-eyebrow">{mode}</p>
              {VISIONS.map((v) => (
                <div key={v} style={{ display: "grid", gap: 5 }}>
                  <span className="kc-hint">{v}</span>
                  <Chips colors={scaleFor(mode, v, "categorical")} label={`Categorical palette, ${v}`} />
                  <Chips colors={scaleFor(mode, v, "diverging")} label={`Diverging scale, ${v}`} />
                </div>
              ))}
              <div style={{ display: "grid", gap: 5 }}>
                <span className="kc-hint">sequential</span>
                <Chips colors={sequential[mode]} label="Sequential scale" />
              </div>
            </div>
          ))}
        </div>
        <DataTable
          label="Smallest perceptual distance in each scale under each colour vision"
          rows={cvd.flatMap((c) => [
            ...c.categorical.map((r) => ({ mode: c.mode, check: `Categorical, first ${r.first}`, v: Object.fromEntries(VISIONS.map((x) => [x, `${r.min[x].d}`])) })),
            { mode: c.mode, check: "Up vs down", v: Object.fromEntries(VISIONS.map((x) => [x, String(c.upDown[x])])) },
            { mode: c.mode, check: "Diverging, mirrored steps", v: Object.fromEntries(VISIONS.map((x) => [x, String(c.divergingMirror[x])])) },
            { mode: c.mode, check: "Sequential, neighbours", v: Object.fromEntries(VISIONS.map((x) => [x, String(c.sequentialAdjacent[x])])) },
          ])}
          rowKey={(r) => r.mode + r.check}
          rowHeader={(r) => `${r.check} (${r.mode})`}
          rowHeaderLabel="Check, theme"
          columns={VISIONS.map((x) => ({ header: x, cell: (r: { v: Record<string, string> }) => r.v[x] }))}
          dense
        />
        <Note>
          Distance is OKLab ΔE × 100: about 2 is just noticeable, under 5 is hard to tell apart. Mirrored diverging steps share a lightness, so for protanopes
          and deuteranopes the two sides look alike (3 to 5). That is why every diverging chart also shows the side by position (bars left or right of zero)
          or by a printed signed value (heatmap cells), and why up and down text always carries a sign or a word.
        </Note>
      </Section>

      <Section id="charts" eyebrow="Sample data, both themes" title="Every chart type on cream and on dark paper">
        <div className="pg-themes">
          <div data-theme="light">
            <SampleCharts w={436} />
          </div>
          <div data-theme="dark">
            <SampleCharts w={436} />
          </div>
        </div>
      </Section>

      <Section id="contrast" eyebrow="WCAG 2.2 (gate) and APCA (recorded)" title={`${report.contrast.length} pairs pass WCAG 2.2 in both themes`}>
        <DataTable
          label="Measured contrast of every checked pair"
          rows={report.contrast}
          rowKey={(c) => c.fg + c.bg}
          rowHeader={(c) => (
            <span>
              {c.fg} on {c.bg}
            </span>
          )}
          rowHeaderLabel="Pair"
          columns={[
            { header: "Needs", cell: (c) => `${c.min}:1` },
            { header: "Light", cell: (c) => c.light.wcag.toFixed(2) },
            { header: "Lc", cell: (c) => c.light.apca },
            { header: "Dark", cell: (c) => c.dark.wcag.toFixed(2) },
            { header: "Lc", cell: (c) => c.dark.apca },
            { header: "APCA target", cell: (c) => c.apcaTarget },
          ]}
          dense
        />
        <Note>The build fails if any pair is under its WCAG minimum. APCA Lc (negative: light text on dark) is recorded against a target and listed in docs/colour.md where it falls short.</Note>
      </Section>
    </>
  );
}

function Ramp({ name, steps }: { name: string; steps: Record<string, { hex: string; oklch: string }> }) {
  return (
    <>
      <span>{name}</span>
      {Object.entries(steps).map(([s, sw]) => (
        <i key={s} style={{ background: sw.hex }} title={`${name}.${s} ${sw.hex} ${sw.oklch}`} />
      ))}
    </>
  );
}
