# Institutional style: what the serious firms do, and our rules

KC&C must read like a rating agency or a bank research desk, not like a crypto project. This page lists the
conventions of institutional financial documents, the sources we checked them against, and the rules we take.
The templates in the playground (`/templates`) apply them.

Links were opened by script on 17 Nov 2026. Most answered HTTP 200. Some sites refuse scripted requests (403);
they are marked "(blocks scripts)" and are cited from their public titles.

## 1. What we studied

| Source | Kind | What it shows |
|---|---|---|
| SEC Rule 421(d), plain English in prospectuses: https://www.ecfr.gov/current/title-17/section-230.421 | Regulation | Cover page, summary and risk factors in plain English: short sentences, definite everyday words, active voice, no legal jargon, tables for complex data |
| SEC, *A Plain English Handbook* (1998): https://www.sec.gov/pdf/handbook.pdf (blocks scripts) | Guide | Type and layout for disclosure documents: serif text, ragged right, enough leading, defined terms used sparingly, no all-caps paragraphs |
| FINRA Rule 2241, research analysts and research reports: https://www.finra.org/rules-guidance/rulebooks/finra-rules/2241 | Regulation | Research reports carry disclosures (conflicts, ratings definitions, price-chart history) in a fixed, findable place |
| SEC Regulation AC, analyst certification: https://www.sec.gov/rules/final/33-8193.htm (blocks scripts) | Regulation | A research note states that the views are the analyst's own |
| SEC Rule 17g-7, rating action disclosure: https://www.ecfr.gov/current/title-17/section-240.17g-7 | Regulation | Each rating action comes with a form: the rating, its meaning, the method, the main assumptions, limits of the data |
| EU CRA Regulation 1060/2009: https://eur-lex.europa.eu/eli/reg/2009/1060/oj and ESMA: https://www.esma.europa.eu/credit-rating-agencies | Regulation | Rating reports name the method and its version, the sources, whether the rated entity saw the report first, and the rating history |
| ECB *Financial Stability Review*: https://www.ecb.europa.eu/pub/financial-stability/fsr/html/index.en.html | Central bank | Numbered charts with source lines, a box for each special topic, an edition date, restrained colour |
| Federal Reserve *Financial Stability Report*: https://www.federalreserve.gov/publications/financial-stability-report.htm | Central bank | One finding as each heading, a figure note under every chart (source, last observation, method) |
| BIS *Quarterly Review*: https://www.bis.org/quarterlyreviews/index.htm and *Annual Economic Report*: https://www.bis.org/publ/arpdf/ar2025e.htm | Central bank | Dense, quiet tables; graphs numbered by chapter; footnotes for every series |
| Loan Market Association: https://www.lma.eu.com/ | Market standard | Term sheets: "indicative", "subject to contract", defined terms, numbered clauses, a schedule for fees |
| FIRST Traffic Light Protocol: https://www.first.org/tlp/ | Standard | Fixed words for who may see a document, shown at the top and bottom of every page |
| CFA Institute Code and Standards: https://www.cfainstitute.org/standards/professionals/code-ethics-standards | Professional code | Tell facts apart from opinions; disclose conflicts; keep records |
| ISO 8601 dates: https://www.iso.org/iso-8601-date-and-time-format.html (blocks scripts) | Standard | Unambiguous dates and times; we print "17 Nov 2026, 17:00 UTC" and use ISO in file names and data |
| FT Visual Vocabulary: https://ft-interactive.github.io/visual-vocabulary/ ; Bloomberg Terminal design notes: https://www.bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/ (blocks scripts) | Data press | Charts chosen by relation; dense data that stays calm through alignment, a strict type hierarchy and few colours |
| New York commercial finance disclosure (23 NYCRR 600): https://www.dfs.ny.gov/apps_and_licensing/commercial_finance_disclosure (blocks scripts) | Regulation | A disclosure that looks like a form, in a fixed order |

We looked at the conventions, not at any firm's identity. Our logos, names and layouts are our own.

## 2. The conventions, and our rules

1. **Restraint.** Institutional documents use one or two colours, a serif for authority and white space for
   order. **Rule:** paper, ink and one heavy green. Colour only for state and change. No decoration.
2. **Serif authority, sans data.** Prospectuses and central-bank reports set text in a serif and tables and
   charts in a sans. **Rule:** DESIGN.md, section 2.
3. **Rules over boxes.** Research notes and rating reports separate parts with thin rules, not shaded panels.
   **Rule:** the 1 px ink rule. The legal box is the only frame. Sheets sit on a tone only because they stand
   for paper.
4. **Dense but quiet tables.** BIS and rating-agency tables have many numbers but few lines. **Rule:** hairlines
   between rows, an ink rule above, right-aligned tabular figures, no zebra stripes, no vertical lines except in
   the rating box and the legal box.
5. **Numbered, sourced exhibits.** "Figure 1", "Table 1", each with a source line and a date. **Rule:** captions
   start with the exhibit number in documents, then the measure and the source.
6. **Footnoted sources.** Every fact traces to a source. **Rule:** footnotes (`FnRef`, `Footnotes`) and the
   evidence labels [F], [I], [H], [P].
7. **Disclaimers in a fixed place.** "Important information" at the end, the same every time. **Rule:**
   `Disclaimer`. It says what the document is not (advice, an offer), who publishes it, and that KC&C publishes
   data and does not lend.
8. **Version and date stamps.** Every document has a number, a version and an issue date. A correction is a new
   version with the change stated. **Rule:** `DocMeta` and the running footer.
9. **Document numbering.** **Rule:** `KCC-<type>-<year>-<sequence>`, for example KCC-RN-2026-014. Types: PR
   proposal, RN research note, TS term sheet, MR monthly report (sequence = month), RR rating report, DK deck,
   LT letter.
10. **Confidentiality marks.** A document for a named counterparty says so on every page: "Confidential — for
    Northwind Capital". **Rule:** `ClassMark` at the top and in the running footer. Levels: Public (no mark), Internal,
    Confidential (always with a named recipient).
11. **Page furniture.** Running header (logo, title, classification) and footer (number, version, date, page x of
    y). **Rule:** `Sheets` adds it to every page. Use sheets for documents that leave as a PDF or are read page by
    page (term sheets, rating reports, research notes). Use web pages for reports read on screen.
12. **Rating action first.** A rating report opens with the action box: grade, outlook, action, date, what the
    grade means. **Rule:** `RatingAction`, then rationale, metrics, sensitivities ("what would move the grade"),
    history, method version, disclosures.
13. **Term sheets do not bind.** "Indicative", "subject to contract", "not an offer", with defined terms
    capitalised. **Rule:** a Status callout at the top, `TermSheet` numbered terms, fees in a schedule.
14. **Plain English.** Regulators ask for it, and serious firms use it. **Rule:** DESIGN.md, section 10.

## 3. What we avoid (crypto clichés)

| Avoid | Because | Instead |
|---|---|---|
| Neon colours, glows, gradients | They read as promotion and date fast | Ink on paper; one heavy green |
| Coins, tokens, circuit patterns, blockchain cubes | They make a data firm look like a token project | Type, rules and numbers |
| Rocket, moon, fire and other emoji | Unserious; not readable by screen readers | Words |
| Dark-first, glassy screens | The look of trading apps | Paper first; a dark theme that is warm paper at night |
| Huge APYs, "safe", "guaranteed", countdowns | Misleading, and regulators forbid them | Rates after expected loss, with a bad-year figure and a source |
| Logos in circles or with 3D effects | A coin by another name | Square marks, flat, one colour |

## 4. Where each rule lives

- Tokens and components: `packages/design` (`Sheets`, `DocMeta`, `ClassMark`, `KeyData`, `RatingAction`,
  `TermSheet`, `Disclaimer`, `Slide`, `EmailSignature`).
- Templates: `apps/playground/app/(sheet)/templates/*`, exported to `html/templates/*.html`.
- Brand: `brand/README.md`, DESIGN.md section 16.
