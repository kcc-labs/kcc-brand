import type { ReactNode } from "react";
import { cx } from "./cx";

export type Tone = "up" | "down" | "neutral";

/* ---------- Figures ---------- */

export type FigureItem = { value: ReactNode; label: ReactNode; basis?: ReactNode };

/** A row of big serif numbers. Each has a label and, when it could be misread, its basis and date. */
export function Figures({ items, compact, className }: { items: FigureItem[]; compact?: boolean; className?: string }) {
  return (
    <dl className={cx("kc-figs", compact && "kc-figs--compact", className)}>
      {items.map((f, i) => (
        <div className="kc-fig" key={i}>
          <dt className="kc-fig__label">{f.label}</dt>
          <dd className="kc-fig__value">{f.value}</dd>
          {f.basis ? <dd className="kc-fig__basis">{f.basis}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/* ---------- Diff chip, pill, honesty labels ---------- */

/** A change. `tone` is what the change means for the reader (up = better), not the sign. Write the sign or a word. */
export function Diff({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`kc-diff kc-diff--${tone}`}>{children}</span>;
}

export type PillTone = "up" | "down" | "watch" | "neutral" | "sample";

/** A status, always as a word ("OK", "Watch", "Margin call", "Sample"). Colour and the marker shape repeat it. */
export function Pill({ tone = "neutral", children }: { tone?: PillTone; children: ReactNode }) {
  return <span className={`kc-pill kc-pill--${tone}`}>{children}</span>;
}

const EVIDENCE = {
  F: "Fact, with a cited source",
  I: "Our interpretation",
  H: "Hypothesis: not yet tested",
  P: "Planned, not yet done",
} as const;

/** [F] fact, [I] interpretation, [H] hypothesis, [P] planned. Put it before the claim it labels. */
export function Evidence({ kind }: { kind: keyof typeof EVIDENCE }) {
  return (
    <abbr className={`kc-ev kc-ev--${kind.toLowerCase()}`} title={EVIDENCE[kind]}>
      [{kind}]
    </abbr>
  );
}

/** A dashed tag for "assumption", "sample", "estimate", "simulated". */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="kc-tag">{children}</span>;
}

/* ---------- Notes and footnotes ---------- */

export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("kc-note", className)}>{children}</p>;
}

/** A footnote mark in the text: links to #fn-{n}. */
export function FnRef({ n }: { n: number }) {
  return (
    <sup className="kc-fnref" id={`fnref-${n}`}>
      <a href={`#fn-${n}`} aria-label={`Note ${n}`}>
        {n}
      </a>
    </sup>
  );
}

export function Footnotes({ items }: { items: ReactNode[] }) {
  return (
    <ol className="kc-footnotes">
      {items.map((t, i) => (
        <li id={`fn-${i + 1}`} key={i}>
          {t}{" "}
          <a href={`#fnref-${i + 1}`} aria-label={`Back to note ${i + 1} in the text`}>
            ↩
          </a>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Callout ---------- */

/** Scope, assumptions, method: a ruled block with a label column. Not a box, not a colour. */
export function Callout({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="kc-callout">
      <p className="kc-callout__label">{label}</p>
      <div className="kc-callout__body">{children}</div>
    </div>
  );
}

/* ---------- Flow strip and phases ---------- */

export type FlowStep = { title: ReactNode; body: ReactNode; yours?: boolean };

/** Who does what, in order. Steps the reader owns (`yours`) sit on the sunk paper. */
export function Flow({ steps, label }: { steps: FlowStep[]; label?: string }) {
  return (
    <ol className="kc-flow" aria-label={label}>
      {steps.map((s, i) => (
        <li key={i} className={s.yours ? "kc-flow--yours" : undefined}>
          <span className="kc-flow__title">{s.title}</span>
          <span>{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

export type Phase = { when: ReactNode; what: ReactNode; status?: ReactNode; now?: boolean };

/** A timeline: when (left), what (middle), an optional status pill (right). */
export function Phases({ items }: { items: Phase[] }) {
  return (
    <ol className="kc-phases">
      {items.map((p, i) => (
        <li key={i} className={p.now ? "kc-phases--now" : undefined} aria-current={p.now ? "step" : undefined}>
          <span className="kc-phases__when">{p.when}</span>
          <div className="kc-phases__what">{typeof p.what === "string" ? <p>{p.what}</p> : p.what}</div>
          {p.status ? <span>{p.status}</span> : <span />}
        </li>
      ))}
    </ol>
  );
}

/* ---------- Two columns of lists ---------- */

export function TwoColumns({ children }: { children: ReactNode }) {
  return <div className="kc-two">{children}</div>;
}

export function ListBlock({ title, items }: { title: ReactNode; items: ReactNode[] }) {
  return (
    <div>
      <h3 className="kc-h3">{title}</h3>
      <ul className="kc-list">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
