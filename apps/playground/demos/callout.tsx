import { Callout } from "@kcc/design";

export default function Demo() {
  return (
    <>
      <Callout label="Scope">
        <p>CC used as collateral to borrow dollars. The USD stablecoin pools are modelled as one debt pool.</p>
      </Callout>
      <Callout label="Assumptions">
        <ul>
          <li>Borrower behaviour and the manual operator&apos;s delay (48 h) are ours.</li>
          <li>The simulated USD supply is about 20% below the public figure.</li>
        </ul>
      </Callout>
    </>
  );
}
