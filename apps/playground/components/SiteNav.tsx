"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@kcc/design";

const items = [
  { href: "/tokens", label: "Tokens" },
  { href: "/colour", label: "Colour" },
  { href: "/components", label: "Components" },
  { href: "/brand", label: "Brand" },
  { href: "/templates", label: "Templates" },
  { href: "/examples/proposal", label: "Proposal" },
  { href: "/examples/dashboard", label: "Dashboard" },
  { href: "/examples/mero-quote", label: "Mero" },
];

/** The design package's Nav, given the current path from the router. */
export function SiteNav() {
  const path = usePathname();
  return (
    <Nav
      brand={
        <>
          KC&amp;C <span>design</span>
        </>
      }
      items={items}
      current={path}
    />
  );
}
