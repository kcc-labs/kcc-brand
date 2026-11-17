import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Note, PageTitle, Section } from "@kcc/design";

export const metadata: Metadata = { title: "Templates" };

const templates = [
  { slug: "proposal", name: "One-page proposal", form: "Web page", use: "A proposal for a named counterparty, shown with a fictional pool. Confidential mark and stamp." },
  { slug: "research-note", name: "Research note", form: "A4 sheets", use: "A finding, key points with evidence labels, key data column, figures, method, disclosures." },
  { slug: "term-sheet", name: "Term sheet", form: "Letter sheets", use: "Indicative terms as numbered defined terms; status says non-binding; schedule." },
  { slug: "monthly-report", name: "Monthly monitoring report", form: "Web page", use: "For a client: four figures, a watchlist against their limits, charts, parameter changes." },
  { slug: "rating-report", name: "Rating report", form: "A4 sheets", use: "Rating action first (grade, outlook, action, date, band), rationale, metrics, sensitivities, history." },
  { slug: "deck", name: "Deck", form: "16:9 slides", use: "One finding a slide. Green cover only. Number, date, confidentiality and slide x / y on every slide." },
  { slug: "letterhead", name: "Letterhead and email signature", form: "A4 sheet, HTML table", use: "Letters with a reference line; a signature with inline styles for mail clients." },
];

export default function Templates() {
  return (
    <>
      <PageTitle
        title="Templates"
        lede="Institutional documents built from the system: the furniture (number, version, date, classification, page x of y) is part of each template, so no document leaves without it."
      />
      <Section id="t-list" eyebrow="Seven templates" title="Open one, replace the sample content, keep the furniture">
        <DataTable
          label="Document templates"
          rows={templates}
          rowKey={(t) => t.slug}
          rowHeader={(t) => <Link href={`/templates/${t.slug}`}>{t.name}</Link>}
          rowHeaderLabel="Template"
          columns={[
            { header: "Form", text: true, cell: (t) => t.form },
            { header: "Use", text: true, cell: (t) => <span style={{ whiteSpace: "normal" }}>{t.use}</span> },
            { header: "Single file", text: true, cell: (t) => <code>html/templates/{t.slug}.html</code> },
          ]}
        />
        <Note>
          React: the pages in apps/playground/app/(sheet)/templates use Sheets, DocMeta, ClassMark, KeyData, RatingAction, TermSheet, Disclaimer, Slide and
          EmailSignature from @kcc/design. Single files: npm run build exports each template, with the CSS inline and no scripts, to html/templates/.
        </Note>
      </Section>
    </>
  );
}
