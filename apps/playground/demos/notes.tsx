import { Evidence, FnRef, Footnotes, Note, Tag } from "@kcc/design";

export default function Demo() {
  return (
    <>
      <p>
        <Evidence kind="F" /> About 20M CC was supplied on 1 November (sample data).
        <FnRef n={1} /> <Evidence kind="H" /> Most of it sits with a few large borrowers. <Tag>assumption</Tag>
      </p>
      <Note>
        <b>Scope:</b> CC used as collateral to borrow dollars. CBTC and stablecoins as collateral are not simulated here.
      </Note>
      <Footnotes items={["Example Lending Pool, public pool endpoint, snapshot 1 Nov 2026, 00:00 UTC (sample data)."]} />
    </>
  );
}
