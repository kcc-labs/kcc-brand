import { Nav } from "@kcc/design";

export default function Demo() {
  return (
    <Nav
      label="Example"
      brand={<>mero <span>by KC&amp;C</span></>}
      current="/borrow"
      items={[
        { href: "/borrow", label: "Borrow" },
        { href: "/lend", label: "Lend" },
        { href: "/monitor", label: "Monitor" },
        { href: "/method", label: "Method" },
      ]}
    />
  );
}
