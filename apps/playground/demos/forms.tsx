import { Actions, Button, describedBy, Field, Input, SegmentedControl, Select } from "@kcc/design";

export default function Demo() {
  return (
    <form className="kc-form" style={{ maxWidth: 377 }} action="#">
      <Field id="amount" label="Amount you want to borrow" hint="In US dollars, from $10,000">
        <Input id="amount" name="amount" numeric prefix="$" defaultValue="50,000" aria-describedby={describedBy("amount", true)} />
      </Field>
      <Field id="collateral" label="CC you put up" error="Enter at least 400,000 CC for this amount.">
        <Input id="collateral" name="collateral" numeric suffix="CC" defaultValue="250,000" aria-invalid="true" aria-describedby={describedBy("collateral", false, true)} />
      </Field>
      <Field id="term" label="Term">
        <Select id="term" name="term" defaultValue="90">
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">180 days</option>
        </Select>
      </Field>
      <SegmentedControl name="repay" legend="Repayment" defaultValue="end" options={[{ value: "end", label: "At the end" }, { value: "monthly", label: "Every 30 days" }]} />
      <Actions>
        <Button kind="primary" type="submit">Get quote</Button>
        <Button>Reset</Button>
        <Button kind="quiet">How we price</Button>
      </Actions>
    </form>
  );
}
