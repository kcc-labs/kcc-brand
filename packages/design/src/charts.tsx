import type { ReactNode } from "react";
import {
  columns as columnsDrawing,
  divergingBars,
  heatmap,
  lineChart,
  pairedBars,
  sparkline,
  stackedArea,
  type ColumnOptions,
  type DivergingOptions,
  type Drawing,
  type HeatmapOptions,
  type LineOptions,
  type PairedOptions,
  type SparkOptions,
  type StackedOptions,
} from "./charts/core";

/** Renders a Drawing from charts/core as inline SVG. Text stays text; every bar has a <title>. */
export function Svg({ d, className, spark }: { d: Drawing; className?: string; spark?: boolean }) {
  const style = spark ? undefined : { maxWidth: d.w, minWidth: Math.min(d.w, 520) };
  return (
    <svg
      viewBox={`0 0 ${d.w} ${d.h}`}
      width={spark ? d.w : undefined}
      height={spark ? d.h : undefined}
      style={style}
      role="img"
      aria-label={d.label}
      className={spark ? "kc-spark" : className}
    >
      {d.nodes.map((n, i) => {
        switch (n.t) {
          case "line":
            return <line key={i} x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} className={n.c} />;
          case "rect":
            return (
              <rect key={i} x={n.x} y={n.y} width={n.w} height={n.h} className={n.c}>
                {n.title ? <title>{n.title}</title> : null}
              </rect>
            );
          case "text":
            return (
              <text key={i} x={n.x} y={n.y} className={n.c} textAnchor={n.a && n.a !== "start" ? n.a : undefined}>
                {n.s}
              </text>
            );
          case "path":
            return <path key={i} d={n.d} className={n.c} />;
          case "circle":
            return <circle key={i} cx={n.x} cy={n.y} r={n.r} className={n.c} />;
        }
      })}
    </svg>
  );
}

/** A chart in a <figure>: optional legend above, the SVG (scrolls sideways on phones), caption below. */
export function ChartFigure({ d, caption, legend }: { d: Drawing; caption?: ReactNode; legend?: ReactNode }) {
  return (
    <figure className="kc-chart">
      {legend}
      <div className="kc-chart__scroll">
        <Svg d={d} />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

type Fig = { caption?: ReactNode; legend?: ReactNode };

export const DivergingBars = ({ caption, legend, ...o }: DivergingOptions & Fig) => <ChartFigure d={divergingBars(o)} caption={caption} legend={legend} />;
export const PairedBars = ({ caption, legend, ...o }: PairedOptions & Fig) => (
  <ChartFigure
    d={pairedBars(o)}
    caption={caption}
    legend={legend ?? <Legend items={[{ label: o.series[0], swatch: "kc-c-a" }, { label: o.series[1] }]} />}
  />
);
export const LineChart = ({ caption, legend, ...o }: LineOptions & Fig) => <ChartFigure d={lineChart(o)} caption={caption} legend={legend} />;
export const Columns = ({ caption, legend, ...o }: ColumnOptions & Fig) => <ChartFigure d={columnsDrawing(o)} caption={caption} legend={legend} />;
export const StackedArea = ({ caption, legend, ...o }: StackedOptions & Fig) => <ChartFigure d={stackedArea(o)} caption={caption} legend={legend} />;
export const Heatmap = ({ caption, legend, ...o }: HeatmapOptions & Fig) => <ChartFigure d={heatmap(o)} caption={caption} legend={legend} />;

/** A small line for tables and figure rows. Its accessible name states first, last, low and high. */
export const Sparkline = (o: SparkOptions) => <Svg d={sparkline(o)} spark />;

/** Legend as text with swatches. `swatch` is a chart class: kc-c-a, kc-c-up, kc-c-down, kc-c-cat-N, kc-line, kc-limit. */
export function Legend({ items }: { items: { label: ReactNode; swatch?: string }[] }) {
  return (
    <ul className="kc-legend">
      {items.map((it, i) => (
        <li key={i}>
          <i className={it.swatch} aria-hidden="true" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** The 9 steps of the diverging or sequential scale, with end labels. */
export function ScaleKey({ scale, low, high }: { scale: "diverging" | "sequential"; low: ReactNode; high: ReactNode }) {
  const v = scale === "diverging" ? "div" : "seq";
  return (
    <div>
      <ul className="kc-scale" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <li key={i} style={{ background: `var(--kc-${v}-${i + 1})` }} />
        ))}
      </ul>
      <p className="kc-scale-labels">
        <span>{low}</span>
        <span>{high}</span>
      </p>
    </div>
  );
}
