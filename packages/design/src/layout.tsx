import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "./cx";

/** The page column: 987 px of content plus gutters. */
export function Page({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("kc-page", className)} {...rest} />;
}

/** Link that jumps past the navigation; put it first in <body>. */
export function SkipLink({ href = "#main", children = "Skip to content" }: { href?: string; children?: ReactNode }) {
  return (
    <a className="kc-skip" href={href}>
      {children}
    </a>
  );
}

/** One ruled line: who publishes (left) and what and when (right). */
export function Masthead({ left, right, className }: { left: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <header className={cx("kc-mast", className)}>
      <span>{left}</span>
      {right ? <span>{right}</span> : null}
    </header>
  );
}

/** The h1 and its lede. `app` gives the smaller title used inside apps. */
export function PageTitle({ title, lede, app, children }: { title: ReactNode; lede?: ReactNode; app?: boolean; children?: ReactNode }) {
  return (
    <>
      <h1 className={cx("kc-title", app && "kc-title--app")}>{title}</h1>
      {lede ? <p className="kc-lede">{lede}</p> : null}
      {children}
    </>
  );
}

/**
 * A ruled section: 1 px rule, eyebrow (what and basis), heading (the finding as a sentence), then content.
 * Pass `id` to link the heading to the section for screen readers.
 */
export function Section({
  eyebrow,
  title,
  id,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  id: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("kc-section", className)} aria-labelledby={id}>
      <hgroup className="kc-head">
        {eyebrow ? <p className="kc-eyebrow">{eyebrow}</p> : null}
        <h2 className="kc-h2" id={id}>
          {title}
        </h2>
      </hgroup>
      {children}
    </section>
  );
}

/** Serif reading text at the measure (about 66 characters a line). */
export function Prose({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("kc-prose", className)} {...rest} />;
}

/** Method, source and disclaimer lines at the end of a page. */
export function Footer({ children, className }: { children: ReactNode; className?: string }) {
  return <footer className={cx("kc-footer", className)}>{children}</footer>;
}

/** 12-column grid (63 px columns, 21 px gutters). Children take `className="kc-col-4"` etc.; one column on phones. */
export function Grid({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("kc-grid", className)} {...rest} />;
}

/** Golden split: `aside` (377) beside `main` (610) from 880 px; stacked below. */
export function Split({ aside, children, className }: { aside: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx("kc-split", className)}>
      <div>{aside}</div>
      <div>{children}</div>
    </div>
  );
}
