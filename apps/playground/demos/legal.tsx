import { LegalBox, LegalGrid, LegalRow } from "@kcc/design";

export default function Demo() {
  return (
    <LegalBox id="demo-legal" title="Commercial financing disclosure" reference="New York, 23 NYCRR 600. Sample" foot={<>SHA-256 of this disclosure: <code>9f2c…e41a</code></>}>
      <LegalGrid
        items={[
          { label: "Total amount of financing", value: "$50,000.00", def: "The amount of the loan." },
          { label: "Finance charge", value: "$1,380.82", def: "All interest and fees you pay to borrow." },
          { label: "Estimated APR", value: "11.32%", def: "The yearly cost, fees included." },
        ]}
      />
      <LegalRow label="Prepayment">You may repay all or part at any time with no penalty.</LegalRow>
    </LegalBox>
  );
}
