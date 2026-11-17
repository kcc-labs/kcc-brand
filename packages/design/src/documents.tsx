import { Children, type ReactNode } from "react";
import { cx } from "./cx";
import { BRAND_COLORS, Logo } from "./brand";
import type { LogoName } from "./brand-data";

/* ---------- Document identity ---------- */

export type Classification = "public" | "internal" | "confidential";

/** Everything that identifies a document. Every page meant for a named counterparty is "confidential" with a recipient. */
export type DocInfo = {
  /** Document number: KCC-<type>-<year>-<sequence>, for example KCC-RN-2026-014. */
  number: string;
  version: string;
  /** Issue date as written on the page: "17 Nov 2026". */
  date: string;
  title: string;
  classification: Classification;
  /** Named recipient, required for "confidential". */
  recipient?: string;
  /** Draft, Final, Superseded. */
  status?: string;
  brand?: LogoName;
};

/** The classification mark. Confidential documents name their recipient: "Confidential — for Northwind Capital". */
export function ClassMark({ level, recipient }: { level: Classification; recipient?: string }) {
  if (level === "public") return null;
  return (
    <span className={cx("kc-class", level === "confidential" && "kc-class--confidential")}>
      {level === "confidential" ? "Confidential" : "Internal"}
      {level === "confidential" && recipient ? <span> — for {recipient}</span> : null}
    </span>
  );
}

/** The document stamp: number, version, date, status, as a ruled line of labels and values. */
export function DocMeta({ doc }: { doc: DocInfo }) {
  const items: [string, string][] = [
    ["Document", doc.number],
    ["Version", doc.version],
    ["Date", doc.date],
    ...(doc.status ? ([["Status", doc.status]] as [string, string][]) : []),
  ];
  return (
    <dl className="kc-docmeta">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Sheets: print-style pages with running header and footer ---------- */

/**
 * Print-style pages for documents that leave as a PDF or are read page by page (term sheets, rating reports).
 * Each child is one page. Every page gets the running header (logo, title, classification) and footer
 * (number, version, date, "Page x of y"). Pages are A4 by default; `letter` gives US Letter.
 */
export function Sheets({ doc, children, letter }: { doc: DocInfo; children: ReactNode; letter?: boolean }) {
  const pages = Children.toArray(children);
  return (
    <div className="kc-desk">
      {pages.map((page, i) => (
        <article key={i} className={cx("kc-sheet", letter && "kc-sheet--letter")} aria-label={`Page ${i + 1} of ${pages.length}`}>
          <header className="kc-sheet__head">
            <Logo name={doc.brand ?? "kcc-wordmark"} height={21} />
            <div className="kc-sheet__head-right">
              <span>{doc.title}</span>
              <ClassMark level={doc.classification} recipient={doc.recipient} />
            </div>
          </header>
          <div className="kc-sheet__body">{page}</div>
          <footer className="kc-sheet__foot">
            <span>
              {doc.number} · v{doc.version} · {doc.date}
            </span>
            {doc.classification === "confidential" ? <span>Confidential — for {doc.recipient ?? "the named recipient"}</span> : null}
            <span>
              Page {i + 1} of {pages.length}
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}

/* ---------- Institutional blocks ---------- */

/** The research-note side column: key data as label / value rows under an ink rule. */
export function KeyData({ title, rows }: { title: ReactNode; rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="kc-keydata">
      <p className="kc-keydata__title">{title}</p>
      <dl>
        {rows.map(([k, v], i) => (
          <div key={i}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A rating action: grade in the serif, then outlook, action, date and the default-probability band. */
export function RatingAction({ items }: { items: { label: ReactNode; value: ReactNode; grade?: boolean }[] }) {
  return (
    <dl className="kc-rating">
      {items.map((it, i) => (
        <div key={i}>
          <dt>{it.label}</dt>
          <dd className={it.grade ? "kc-rating__grade" : undefined}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A term sheet: numbered defined terms. Defined terms are capitalised in the text that uses them. */
export function TermSheet({ terms }: { terms: { term: ReactNode; text: ReactNode }[] }) {
  return (
    <ol className="kc-terms">
      {terms.map((t, i) => (
        <li key={i}>
          <span className="kc-terms__term">{t.term}</span>
          <div className="kc-terms__text">{typeof t.text === "string" ? <p>{t.text}</p> : t.text}</div>
        </li>
      ))}
    </ol>
  );
}

/** "Important information": disclaimers, conflicts, methodology references, at the end of a document. */
export function Disclaimer({ title = "Important information", children, columns }: { title?: ReactNode; children: ReactNode; columns?: boolean }) {
  return (
    <section className={cx("kc-disclaimer", columns && "kc-disclaimer--cols")} aria-label="Important information">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/* ---------- Slides ---------- */

/** One 16:9 slide with its furniture. Type scales with the slide, so slides read on a phone. */
export function Slide({
  doc,
  n,
  total,
  section,
  children,
  green,
}: {
  doc: DocInfo;
  n: number;
  total: number;
  section?: ReactNode;
  children: ReactNode;
  green?: boolean;
}) {
  return (
    <section className={cx("kc-slide", green && "kc-slide--green")} aria-label={`Slide ${n} of ${total}`}>
      <div className="kc-slide__top">
        <Logo name={doc.brand ?? "kcc-wordmark"} height={16} variant={green ? "reversed-green" : "auto"} />
        <span>{section}</span>
      </div>
      <div className="kc-slide__body">{children}</div>
      <div className="kc-slide__foot">
        <span>
          {doc.number} · {doc.date}
        </span>
        {doc.classification === "confidential" ? <span>Confidential — for {doc.recipient}</span> : <span />}
        <span>
          {n} / {total}
        </span>
      </div>
    </section>
  );
}

/* ---------- Email signature ---------- */

/**
 * An email signature for mail clients: a table with inline styles and fixed brand hex colours (mail clients ignore
 * CSS variables and most stylesheets). `logoSrc` must be a hosted PNG (brand/icons/kcc/icon-192.png); mail
 * clients block SVG. Copy the rendered HTML from the letterhead template page.
 */
export function EmailSignature({ name, role, email, phone, logoSrc }: { name: string; role: string; email: string; phone?: string; logoSrc: string }) {
  const { ink } = BRAND_COLORS;
  const muted = "#4A4A46";
  const sans = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const serif = "'EB Garamond', Georgia, 'Times New Roman', serif";
  return (
    <table cellPadding={0} cellSpacing={0} role="presentation" style={{ borderCollapse: "collapse", color: ink, fontFamily: sans, fontSize: 13, lineHeight: "18px" }}>
      <tbody>
        <tr>
          <td style={{ paddingRight: 13, verticalAlign: "top" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- mail clients need a plain img */}
            <img src={logoSrc} width={34} height={34} alt="KC&C" style={{ display: "block", border: 0 }} />
          </td>
          <td style={{ borderLeft: `1px solid ${ink}`, paddingLeft: 13, verticalAlign: "top" }}>
            <div style={{ fontFamily: serif, fontSize: 17, lineHeight: "21px", fontWeight: 500 }}>{name}</div>
            <div style={{ color: muted }}>{role} · KC&amp;C</div>
            <div style={{ color: muted }}>
              <a href={`mailto:${email}`} style={{ color: ink }}>
                {email}
              </a>
              {phone ? <> · {phone}</> : null}
            </div>
            <div style={{ color: muted, fontSize: 11, lineHeight: "15px", paddingTop: 5 }}>KC&amp;C publishes data and does not lend.</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
