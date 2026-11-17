import type { Metadata } from "next";
import { DataTable, Note, PageTitle, Section, tokens } from "@kcc/design";

export const metadata: Metadata = { title: "Tokens" };

const { text, space, layout, color, weight, leading, tracking, rule, radius, motion, font } = tokens;
type Sw = { light: string; dark: string; use: string };

function Swatches({ group, prefix }: { group: Record<string, Sw>; prefix: string }) {
  return (
    <div className="pg-themes">
      {(["light", "dark"] as const).map((mode) => (
        <div data-theme={mode} key={mode}>
          <p className="kc-eyebrow">{mode}</p>
          <div className="pg-swatches">
            {Object.entries(group).map(([name, c]) => (
              <div className="pg-swatch" key={name}>
                <i style={{ background: c[mode] }} />
                <b>
                  --{prefix}
                  {name}
                </b>
                <span>{c[mode]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Tokens() {
  return (
    <>
      <PageTitle
        title="Tokens"
        lede="Every value on this page is computed by scripts/build-tokens.ts from the parameters in tokens/tokens.json: sizes from phi and Fibonacci, colours from OKLCH. Never type a colour or size by hand; use the variable."
      />

      <Section id="colour" eyebrow="Colour, semantic" title="Paper, ink and three state colours">
        <Swatches group={color as unknown as Record<string, Sw>} prefix="kc-" />
        <DataTable
          label="Semantic colour tokens and their use"
          rows={Object.entries(color)}
          rowKey={([n]) => n}
          rowHeader={([n]) => <code>--kc-{n}</code>}
          rowHeaderLabel="Token"
          columns={[
            { header: "Light", cell: ([, c]) => c.light },
            { header: "Dark", cell: ([, c]) => c.dark },
            { header: "Use", text: true, cell: ([, c]) => <span style={{ whiteSpace: "normal" }}>{c.use}</span> },
          ]}
        />
        <Note>Ramps, chart scales and the measured contrast are on the Colour page.</Note>
      </Section>

      <Section id="type" eyebrow="Type, px" title="Two families, one scale from a 13 px anchor">
        <div className="pg-type">
          {Object.entries(text)
            .sort((a, b) => a[1].px - b[1].px)
            .map(([n, s]) => (
              <div key={n}>
                <code>
                  --kc-text-{n}
                  <br />
                  {s.px} px · {s.formula}
                </code>
                <span style={{ fontSize: s.px, lineHeight: 1.15, fontFamily: s.px >= 21 || n === "read" ? "var(--kc-serif)" : "var(--kc-sans)", fontWeight: s.px >= 21 ? 500 : 400 }}>
                  {s.px >= 43 ? "+10% · $1.1M" : s.px >= 21 ? "A bigger, busier pool at the same risk" : s.use}
                </span>
              </div>
            ))}
        </div>
        <DataTable
          label="Font, weight, leading and tracking tokens"
          rows={[
            ...Object.entries(font).map(([k, v]) => [`--kc-${k}`, v] as const),
            ...Object.entries(weight).map(([k, v]) => [`--kc-weight-${k}`, String(v)] as const),
            ...Object.entries(leading).map(([k, v]) => [`--kc-leading-${k}`, String(v)] as const),
            ...Object.entries(tracking).map(([k, v]) => [`--kc-tracking-${k}`, String(v)] as const),
          ]}
          rowKey={([k]) => k}
          rowHeader={([k]) => <code>{k}</code>}
          rowHeaderLabel="Token"
          columns={[{ header: "Value", text: true, cell: ([, v]) => <span style={{ whiteSpace: "normal" }}>{v}</span> }]}
        />
      </Section>

      <Section id="space" eyebrow="Space, px" title="Fibonacci steps: each about 1.618 times the last">
        <div className="pg-space">
          {Object.entries(space).map(([n, s]) => (
            <div key={n}>
              <code>
                --kc-{n} {s.px}
              </code>
              <i style={{ width: s.px }} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="grid" eyebrow="Layout, px" title="A 987 px page: 12 columns of 63 with 21 px gutters, and a golden split">
        <div className="pg-gridshow" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <DataTable
          label="Layout tokens"
          rows={Object.entries(layout)}
          rowKey={([n]) => n}
          rowHeader={([n]) => <code>--kc-{n}</code>}
          rowHeaderLabel="Token"
          columns={[
            { header: "px", cell: ([, s]) => s.px },
            { header: "Formula", text: true, cell: ([, s]) => s.formula },
            { header: "Use", text: true, cell: ([, s]) => <span style={{ whiteSpace: "normal" }}>{s.use}</span> },
          ]}
        />
      </Section>

      <Section id="rules" eyebrow="Rules, radius, motion" title="Rules instead of boxes; almost no radius; one easing curve">
        <DataTable
          label="Rule, radius and motion tokens"
          rows={[
            ...Object.entries(rule).map(([k, v]) => [`--kc-rule-${k}`, `${v} px`] as const),
            ...Object.entries(radius).map(([k, v]) => [`--kc-radius-${k}`, `${v} px`] as const),
            ...Object.entries(motion).map(([k, v]) => [`--kc-motion-${k}`, typeof v === "number" ? `${v} ms` : v] as const),
          ]}
          rowKey={([k]) => k}
          rowHeader={([k]) => <code>{k}</code>}
          rowHeaderLabel="Token"
          columns={[{ header: "Value", text: true, cell: ([, v]) => v }]}
        />
        <div className="pg-motion-row" style={{ padding: "13px 0" }}>
          <p className="kc-note">Hover this row: slow (350 ms) on the easing curve. Reduced motion turns it off.</p>
          <div className="pg-motion" />
        </div>
      </Section>
    </>
  );
}
