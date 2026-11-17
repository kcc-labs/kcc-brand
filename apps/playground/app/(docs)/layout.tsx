import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@kcc/design/fonts.css";
import "@kcc/design/kcc.css";
import "../playground.css";
import { FontPreload, Page, SkipLink } from "@kcc/design";
import { SiteNav } from "@/components/SiteNav";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export const metadata: Metadata = {
  title: { default: "KC&C design system", template: "%s · KC&C design" },
  description: "Tokens, components and rules for KC&C documents, reports, proposals and data apps.",
  icons: {
    icon: [{ url: "/brand/kcc/favicon.svg", type: "image/svg+xml" }, { url: "/brand/kcc/favicon.ico", sizes: "16x16 32x32 48x48" }],
    apple: "/brand/kcc/apple-touch-icon.png",
  },
  manifest: "/brand/kcc/site.webmanifest",
  openGraph: { images: [{ url: "/brand/og-sample.png", width: 1200, height: 630 }] },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <FontPreload />
        {/* Apply a saved theme before the first paint, so the page does not flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("kcc-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <SkipLink />
        <Page>
          <SiteNav />
          <div className="pg-top">
            <ThemeSwitch />
          </div>
          <main id="main">{children}</main>
        </Page>
      </body>
    </html>
  );
}
