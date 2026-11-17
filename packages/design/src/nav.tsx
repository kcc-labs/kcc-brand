import type { ReactNode } from "react";

export type NavItem = { href: string; label: ReactNode };

/**
 * Top navigation for a multi-page app: brand on the left, sections on the right, the current one underlined.
 * It wraps on small screens; there is no hidden menu. Pass `current` (the active href) from the router.
 */
export function Nav({ brand, brandHref = "/", items, current, label = "Main" }: { brand: ReactNode; brandHref?: string; items: NavItem[]; current?: string; label?: string }) {
  return (
    <nav className="kc-nav" aria-label={label}>
      <a className="kc-nav__brand" href={brandHref}>
        {brand}
      </a>
      <ul className="kc-nav__list">
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} aria-current={isCurrent(it.href, current) ? "page" : undefined}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A vertical list of links inside a section of an app (settings, method chapters). */
export function SubNav({ items, current, label }: { items: NavItem[]; current?: string; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="kc-subnav">
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} aria-current={it.href === current ? "page" : undefined}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const isCurrent = (href: string, current?: string) => !!current && (current === href || (href !== "/" && current.startsWith(href + "/")));
