import { ListBlock, TwoColumns } from "@kcc/design";

export default function Demo() {
  return (
    <TwoColumns>
      <ListBlock title="What we would ask for" items={["Your parameter change history and the reasons.", "An aggregate view of positions by health factor.", "Past liquidations: size, bonus, time to fill."]} />
      <ListBlock title="What you get" items={["Parameters checked every hour against market depth.", "A second price check against the single feed.", "A method you can cite to suppliers and auditors."]} />
    </TwoColumns>
  );
}
