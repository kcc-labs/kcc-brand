import type { Metadata } from "next";
import { ClassMark, DocMeta, Page, type DocInfo } from "@kcc/design";
import { ProposalDoc } from "@/components/ProposalDoc";

export const metadata: Metadata = { title: "One-page proposal" };

const doc: DocInfo = {
  number: "KCC-PR-2026-007",
  version: "1.0",
  date: "17 Nov 2026",
  title: "Risk parameter pilot",
  classification: "confidential",
  recipient: "Northwind Capital",
};

/** Template: a one-page web proposal for a named counterparty. Confidential, so it carries the mark and the stamp. */
export default function ProposalTemplate() {
  return (
    <Page>
      <ProposalDoc
        stamp={
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
            <DocMeta doc={doc} />
            <ClassMark level={doc.classification} recipient={doc.recipient} />
          </div>
        }
      />
    </Page>
  );
}
