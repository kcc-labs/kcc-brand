import type { Metadata } from "next";
import {
  Actions,
  Button,
  Callout,
  describedBy,
  Evidence,
  Field,
  Figures,
  Footer,
  Input,
  LegalBox,
  LegalGrid,
  LegalRow,
  Nav,
  Note,
  PageTitle,
  Pill,
  SegmentedControl,
  Select,
  Split,
} from "@kcc/design";

export const metadata: Metadata = { title: "Example: mero loan quote" };

/** A sample quote. In the app every figure comes from credit-api as a decimal string; the page only formats it. */
const q = {
  borrow: "$50,000.00",
  payBack: "$51,380.82",
  due: "Feb 15, 2027",
  apr: "11.32%",
  rate: "10.25%",
  fee: "$250.00",
  disbursed: "$49,750.00",
  charge: "$1,380.82",
  collateral: "450,000 CC",
  ltv: "39.2%",
  marginCall: "60%",
  liquidation: "75%",
  asOf: "Nov 17, 2026, 17:00 UTC",
  hash: "9f2c4be1a07d3e55c1b6f2e8a49d0c7713fe2a64b8d95c0e17a3b4f6d2c8e41a",
};

export default function MeroQuote() {
  return (
    <div className="kc-app" style={{ marginTop: 34, fontSize: "var(--kc-text-base)" }}>
      <Nav
        label="mero"
        brand={<>mero <span>by KC&amp;C</span></>}
        current="/borrow"
        items={[
          { href: "/borrow", label: "Borrow" },
          { href: "/lend", label: "Lend" },
          { href: "/monitor", label: "Monitor" },
          { href: "/method", label: "Method" },
        ]}
      />
      <PageTitle app title="Borrow dollars against CC" lede={<>A quote for a 90-day loan, as of {q.asOf}. <Pill tone="sample">Sample quote</Pill></>} />

      <div style={{ marginTop: 34 }}>
        <Split
          aside={
            <form className="kc-form" action="#" aria-label="Loan terms">
              <Field id="q-amount" label="Amount you want to borrow" hint="US dollars, from $10,000 to $500,000">
                <Input id="q-amount" name="amount" numeric prefix="$" defaultValue="50,000" aria-describedby={describedBy("q-amount", true)} />
              </Field>
              <Field id="q-cc" label="CC you put up" hint="At least 2.5 times the loan in value">
                <Input id="q-cc" name="collateral" numeric suffix="CC" defaultValue="450,000" aria-describedby={describedBy("q-cc", true)} />
              </Field>
              <Field id="q-term" label="Term">
                <Select id="q-term" name="term" defaultValue="90">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </Select>
              </Field>
              <SegmentedControl name="repay" legend="Repayment" defaultValue="end" options={[{ value: "end", label: "At the end" }, { value: "monthly", label: "Every 30 days" }]} />
              <Actions>
                <Button kind="primary" type="submit">Get quote</Button>
              </Actions>
            </form>
          }
        >
          <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 21 }}>
            <p className="kc-statement">
              You borrow <strong>{q.borrow}</strong>. You pay back <strong>{q.payBack}</strong> in total by {q.due}.
            </p>
            <Figures
              compact
              items={[
                { value: q.apr, label: "estimated APR", basis: "a year, fees included" },
                { value: q.ltv, label: "loan to value", basis: `margin call at ${q.marginCall}, liquidation at ${q.liquidation}` },
                { value: q.fee, label: "origination fee", basis: "taken at funding" },
              ]}
            />
            <Callout label="What can happen">
              <p>
                If CC falls about 35% and stays there, the loan reaches the margin call at {q.marginCall}: you add CC or repay part within 24 hours. At{" "}
                {q.liquidation}, the lender sells enough CC to repay the loan. <Evidence kind="F" /> CC has fallen 35% within 90 days twice since 2024.
              </p>
            </Callout>
            <LegalBox
              id="ny-disclosure"
              title="Commercial financing disclosure"
              reference={<>New York, 23 NYCRR 600. Form 2026-1, {q.asOf}. Sample</>}
              foot={
                <>
                  The estimated APR is computed under the actuarial method. The SHA-256 hash of this disclosure is stored on the loan contract when you accept:{" "}
                  <code>{q.hash}</code>
                </>
              }
            >
              <LegalGrid
                items={[
                  { label: "Total amount of financing", value: q.borrow, def: "The amount of the loan." },
                  { label: "Disbursement amount", value: q.disbursed, def: "What you receive, after fees taken at funding." },
                  { label: "Finance charge", value: q.charge, def: "All interest and fees you pay to borrow." },
                  { label: "Estimated APR", value: q.apr, def: "The yearly cost, fees included." },
                  { label: "Total repayment", value: q.payBack, def: "Everything you pay back, if you pay as scheduled." },
                  { label: "Term", value: "90 days", def: "One payment at the end of the term." },
                ]}
              />
              <LegalRow label="Payments">One payment of {q.payBack} on {q.due}.</LegalRow>
              <LegalRow label="Prepayment">You may repay all or part at any time with no penalty. Interest is charged only up to the day you repay. The origination fee is not refunded.</LegalRow>
              <LegalRow label="Collateral">{q.collateral}, transferred to the lender of record and returned on repayment.</LegalRow>
              <LegalRow label="Provider">Sample Lender LLC (sample name)</LegalRow>
            </LegalBox>
            <Actions>
              <Button kind="primary">Accept this offer</Button>
              <Button>Change terms</Button>
            </Actions>
            <Note>Interest {q.rate} a year on the amount borrowed.</Note>
          </div>
        </Split>
      </div>
      <Footer>
        <p>mero is a KC&amp;C product. This screen shows a sample quote for the design system; it is not an offer.</p>
      </Footer>
    </div>
  );
}
