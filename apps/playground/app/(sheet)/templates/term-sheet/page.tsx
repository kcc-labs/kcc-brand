import type { Metadata } from "next";
import { Callout, Disclaimer, DocMeta, Sheets, TermSheet, type DocInfo } from "@kcc/design";

export const metadata: Metadata = { title: "Term sheet" };

const doc: DocInfo = {
  number: "KCC-TS-2026-003",
  version: "0.2",
  date: "17 Nov 2026",
  title: "Indicative term sheet · Risk parameter service",
  classification: "confidential",
  recipient: "Sample Counterparty Ltd",
  status: "Draft for discussion",
};

/** Template: an indicative term sheet. Numbered defined terms; the status line says it is not binding. */
export default function TermSheetTemplate() {
  return (
    <Sheets doc={doc} letter>
      <>
        <p className="kc-eyebrow">Indicative terms · not an offer</p>
        <h1 className="kc-title">Risk parameter service</h1>
        <DocMeta doc={doc} />
        <Callout label="Status">
          <p>Indicative and non-binding. Subject to contract, due diligence and each party&apos;s approvals. Only a signed agreement creates obligations.</p>
        </Callout>
        <TermSheet
          terms={[
            { term: "Provider", text: "KC&C (the “Provider”)." },
            { term: "Client", text: "Sample Counterparty Ltd (the “Client”)." },
            {
              term: "Service",
              text: "Hourly risk parameters for CC collateral (loan-to-value, liquidation threshold, liquidation bonus, supply cap), signed and delivered to the Client’s receiver contract.",
            },
            { term: "Bounds", text: "The Client sets a minimum, a maximum and a maximum step per update for each parameter. The receiver applies only values inside the Bounds." },
            { term: "Keys", text: "Loosening requires two separate Provider keys. Tightening requires one. The Client may pause the Service at any time." },
            { term: "Pilot", text: "Four weeks in shadow mode. No value is applied to the Client’s pool during the Pilot." },
            { term: "Fees", text: "Pilot: none. After the Pilot: to be agreed (Schedule 1)." },
            { term: "Data", text: "The Client shares aggregate position data and parameter history. The Provider is never a party to the Client’s transactions." },
            { term: "Confidentiality", text: "Each party keeps the other’s non-public information confidential for three years after the Term." },
            { term: "Liability", text: "To be agreed. The Provider publishes data and does not lend; it gives no guarantee of any outcome." },
            { term: "Term", text: "Twelve months from signature, renewable by agreement." },
            { term: "Governing law", text: "To be agreed." },
          ]}
        />
      </>
      <>
        <h2 className="kc-h2">Schedule 1 · Indicative fees</h2>
        <p className="kc-note">To be completed after the Pilot. Amounts in US dollars, before taxes.</p>
        <TermSheet
          terms={[
            { term: "Base fee", text: "Per month, per pool: to be agreed." },
            { term: "Additional asset", text: "Per month, per collateral asset: to be agreed." },
          ]}
        />
        <div style={{ marginTop: "auto" }}>
          <Disclaimer>
            <p>
              This term sheet summarises indicative terms for discussion. It is not an offer, a commitment or a contract, and it does not create legal
              obligations. Defined terms are capitalised.
            </p>
          </Disclaimer>
        </div>
      </>
    </Sheets>
  );
}
