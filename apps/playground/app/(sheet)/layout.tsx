import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@kcc/design/fonts.css";
import "@kcc/design/kcc.css";
import { FontPreload } from "@kcc/design";

export const metadata: Metadata = {
  title: { default: "KC&C document", template: "%s · KC&C" },
  icons: { icon: [{ url: "/brand/kcc/favicon.svg", type: "image/svg+xml" }], apple: "/brand/kcc/apple-touch-icon.png" },
};

/**
 * Bare layout for document templates: no docs navigation, so each page is the document itself.
 * `npm run build` also exports these pages as standalone HTML into html/templates/.
 */
export default function SheetLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <FontPreload />
      </head>
      <body>{children}</body>
    </html>
  );
}
