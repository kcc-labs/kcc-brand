import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "./cx";

/**
 * Label above, hint under the label, the control, then the error. The control must get `id` and
 * `aria-describedby={describedBy(id, hint, error)}`; Field renders the hint and error with matching ids.
 */
export function Field({ id, label, hint, error, children }: { id: string; label: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode }) {
  return (
    <div className="kc-field">
      <label className="kc-label" htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p className="kc-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="kc-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The aria-describedby value for a control inside Field. */
export const describedBy = (id: string, hint?: unknown, error?: unknown) =>
  [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

type InputProps = ComponentPropsWithoutRef<"input"> & { prefix?: ReactNode; suffix?: ReactNode; numeric?: boolean };

/** Text input. `numeric` right-aligns and asks for a decimal keyboard (the value stays a string). Units go in prefix/suffix. */
export function Input({ prefix, suffix, numeric, className, ...rest }: InputProps) {
  const input = (
    <input
      className={cx("kc-input", numeric && "kc-input--num", className)}
      type="text"
      inputMode={numeric ? "decimal" : undefined}
      autoComplete={numeric ? "off" : rest.autoComplete}
      {...rest}
    />
  );
  if (!prefix && !suffix) return input;
  return (
    <div className="kc-affix">
      {prefix ? <span className="kc-affix__unit" aria-hidden="true">{prefix}</span> : null}
      {input}
      {suffix ? <span className="kc-affix__unit" aria-hidden="true">{suffix}</span> : null}
    </div>
  );
}

export function Select({ className, ...rest }: ComponentPropsWithoutRef<"select">) {
  return <select className={cx("kc-select", className)} {...rest} />;
}

type ButtonKind = "primary" | "secondary" | "quiet";

/** The label is the action ("Get quote"). One primary a view. While pending, change the label and disable. */
export function Button({ kind = "secondary", className, type = "button", ...rest }: ComponentPropsWithoutRef<"button"> & { kind?: ButtonKind }) {
  return <button type={type} className={cx("kc-button", kind !== "secondary" && `kc-button--${kind}`, className)} {...rest} />;
}

/** A link that looks like a button, for navigation actions. */
export function ButtonLink({ kind = "secondary", className, ...rest }: ComponentPropsWithoutRef<"a"> & { kind?: ButtonKind }) {
  return <a className={cx("kc-button", kind !== "secondary" && `kc-button--${kind}`, className)} {...rest} />;
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="kc-actions">{children}</div>;
}

/**
 * One choice of a few, as native radio buttons styled as joined segments. Works without JavaScript and inside a
 * plain <form>. Pass `value` + `onChange` for a controlled control, or `defaultValue`.
 */
export function SegmentedControl({
  name,
  legend,
  options,
  value,
  defaultValue,
  onChange,
  hint,
}: {
  name: string;
  legend: ReactNode;
  options: { value: string; label: ReactNode; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hint?: ReactNode;
}) {
  return (
    <fieldset className="kc-seg">
      <legend className="kc-label">{legend}</legend>
      {hint ? <p className="kc-hint">{hint}</p> : null}
      <div className="kc-seg__options">
        {options.map((o) => (
          <label className="kc-seg__option" key={o.value}>
            <input
              type="radio"
              name={name}
              value={o.value}
              disabled={o.disabled}
              {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })}
              onChange={onChange ? (e) => onChange(e.currentTarget.value) : value !== undefined ? () => {} : undefined}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
