import type { ReactNode } from "react";

/**
 * A legal or disclosure box: square, ink-framed, ruled inside, sans. The only heavy frame in the system, so it is
 * never mistaken for marketing. Compose with LegalGrid (figures) and LegalRow (label + text).
 */
export function LegalBox({ title, reference, id, children, foot }: { title: ReactNode; reference?: ReactNode; id: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <section className="kc-legal" aria-labelledby={id}>
      <header className="kc-legal__head">
        <h2 className="kc-legal__title" id={id}>
          {title}
        </h2>
        {reference ? <p className="kc-legal__ref">{reference}</p> : null}
      </header>
      {children}
      {foot ? <p className="kc-legal__foot">{foot}</p> : null}
    </section>
  );
}

/** Figures in ruled cells, three a row (two on phones): label, value, one-line definition. */
export function LegalGrid({ items }: { items: { label: ReactNode; value: ReactNode; def?: ReactNode }[] }) {
  return (
    <dl className="kc-legal__grid">
      {items.map((it, i) => (
        <div className="kc-legal__cell" key={i}>
          <dt className="kc-legal__label">{it.label}</dt>
          <dd className="kc-legal__value">{it.value}</dd>
          {it.def ? <dd className="kc-legal__def">{it.def}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

export function LegalRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="kc-legal__row">
      <p className="kc-legal__label">{label}</p>
      <div>{children}</div>
    </div>
  );
}
