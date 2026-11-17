import type { Metadata } from "next";
import { EmailSignature, Logo } from "@kcc/design";

export const metadata: Metadata = { title: "Letterhead and email signature" };

/**
 * Template: letterhead (A4 sheet) and email signature. Addresses and names are placeholders; replace them, do not
 * restyle them. The letterhead has no page furniture: a letter is one document, numbered in its reference line.
 */
export default function Letterhead() {
  return (
    <div className="kc-desk">
      <article className="kc-sheet" aria-label="Letterhead">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 21, flexWrap: "wrap", borderBottom: "1px solid var(--kc-rule)", paddingBottom: 21 }}>
          <Logo name="kcc-lockup" height={55} />
          <address className="kc-address" style={{ textAlign: "right" }}>
            KC&amp;C
            <br />
            [Street address]
            <br />
            [City, postcode, country]
            <br />
            [email] · [website]
          </address>
        </header>
        <div className="kc-letter" style={{ marginTop: 55 }}>
          <p className="kc-address">
            Our ref. KCC-LT-2026-031 · 17 November 2026
            <br />
            [Recipient name], [Title]
            <br />
            [Organisation], [Address]
          </p>
          <p>Dear [Name],</p>
          <p>
            Thank you for the call on 12 November. As agreed, this letter confirms the scope of the four-week shadow pilot and the data we would ask you to
            share. The enclosed term sheet sets out the indicative terms; nothing in it is binding until we both sign an agreement.
          </p>
          <p>We will send the first weekly note on Monday 24 November.</p>
          <p>Yours sincerely,</p>
          <p style={{ marginTop: 34 }}>
            [Name]
            <br />
            <span className="kc-address">[Role], KC&amp;C</span>
          </p>
        </div>
        <footer className="kc-address" style={{ marginTop: "auto", borderTop: "1px solid var(--kc-hair)", paddingTop: 8 }}>
          KC&amp;C publishes data and does not lend. [Registered name, number and registered office.]
        </footer>
      </article>

      <section className="kc-sheet" style={{ minHeight: 0 }} aria-labelledby="sig">
        <h2 className="kc-h2" id="sig">
          Email signature
        </h2>
        <p className="kc-note">
          Inline styles and a hosted PNG logo, because mail clients drop stylesheets and SVG. Copy it from html/templates/letterhead.html.
        </p>
        <div style={{ padding: "21px 0" }}>
          <EmailSignature name="[Name]" role="[Role]" email="name@example.com" phone="+00 0000 000000" logoSrc="/brand/kcc/icon-192.png" />
        </div>
      </section>
    </div>
  );
}
