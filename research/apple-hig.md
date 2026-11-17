# Apple Human Interface Guidelines: what we take

The owner chose Apple's Human Interface Guidelines (HIG) as the reference for simplicity. This note gives the
principles in our words, the page each one comes from, and what each one means for a KC&C finance document and
for a data app such as mero. We read the pages on 17 Nov 2026 (the HIG pages are rendered by script; we read the
same text from Apple's documentation data, `developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`).

**What we take: principles only.** We do not copy Apple's visual identity: no SF fonts, no Apple imagery, no
Liquid Glass or other materials, no imitation of Apple pages or product UI. Our look stays paper, ink rules, EB
Garamond and a plain sans.

**Basis.** A rule taken from the HIG has the basis **Guideline (Apple HIG)** in `docs/evidence.md`, with the
page URL and the quoted words. The HIG is a published guideline, not a measurement. Where it conflicts with a
measured study, the study wins and the conflict is noted (section 3).

## 1. Principles

### Simplicity: every element earns its place

- Source: Design principles, "Simplicity",
  https://developer.apple.com/design/human-interface-guidelines/design-principles
- Apple: "A well-designed experience removes the unnecessary, with every element earning its place." "Include
  just what's necessary. Simplicity isn't minimalism." "Be concise ... Choose exactly the words you need."
- **Finance document.** Before you add a block, a rule, a label or a note, ask what job it does for the reader.
  If you cannot name the job, remove it. Simplicity is not minimalism: the unit, basis, date and source of a
  figure are necessary, so they stay.
- **Data app.** A screen shows what the person needs for the next decision. Secondary detail is one action away,
  not on the screen "just in case".

### Hierarchy: the most important thing first and largest

- Sources: Design principles, "Establish hierarchy"; Layout, "Order content by relative importance",
  https://developer.apple.com/design/human-interface-guidelines/layout ; Typography, "Adjust font weight, size,
  and color as needed to emphasize important information",
  https://developer.apple.com/design/human-interface-guidelines/typography ; Writing, "put the most important
  information first", https://developer.apple.com/design/human-interface-guidelines/writing
- **Finance document.** The finding is the heading, the main figure is the largest thing, and the method goes
  below or in the footer. This is what DESIGN.md already asks ("The number is the product", "The heading is the
  finding"); the HIG is now a stated basis for it.
- **Data app.** The quote statement ("You borrow X. You pay back Y by D.") comes before the form detail, the
  figures and the disclosure.

### Restraint: content first, controls and decoration out of the way

- Sources: Design principles, "Stay out of the way ... The best designs are unobtrusive" and "Don't mistake
  delight for decoration"; Charts, "you want the data itself to be most prominent, while letting the descriptions
  and axes provide additional context without competing with the data",
  https://developer.apple.com/design/human-interface-guidelines/charts
- **Finance document.** No ornament. Gridlines are hairlines, labels are muted, the data is ink.
- **Data app.** No splash, no tour, no animation that delays the content.

### Colour with a job, used sparingly

- Source: Color, https://developer.apple.com/design/human-interface-guidelines/color : "reserve it for elements
  that truly benefit from emphasis, such as status indicators or primary actions"; "Avoid using the same color to
  mean different things"; "Avoid relying solely on color to differentiate between objects ... or communicate
  essential information."
- **Finance document.** Paper and ink do the work. Green, red and ochre mean better, worse and watch, and only
  that. One accent at most in a view.
- **Data app.** The same: state colours only for state, and every state also has a word or a sign (this is
  also WCAG 2.2 SC 1.4.1, which we gate).

### Consistency: one behaviour, one look, one word

- Sources: Design principles, "Keep visuals and interactions consistent"; Writing, "Create a list of common terms,
  and reference that list to keep your language consistent"; Charting data, "Prefer consistency across multiple
  charts, deviating only when you need to highlight differences",
  https://developer.apple.com/design/human-interface-guidelines/charting-data
- **Finance document.** The same measure has the same name, unit and colour in every chart and table of a
  document. Use the type scale and the spacing scale; never a one-off value.
- **Data app.** A control looks and behaves the same on every screen.

### Charts: simple, labelled, and only when a chart helps

- Source: Charting data: "Not every collection of data needs to be displayed in a chart ... consider offering the
  data in other ways, such as in a list or table"; "Keep a chart simple, letting people choose when they want
  additional details. Resist the temptation to pack as much data as possible into a chart." Charts: "Summarize the
  main message of your chart"; "Avoid using subjective terms ... use actual values in your descriptions"; "don't
  require interaction to reveal critical information."
- **Finance document.** A chart carries one message, stated in its heading. Few rows: use a table. Do not show
  the same numbers as both a chart and a table on one page; the table for checking goes in an appendix.
- **Data app.** Critical values are printed, not hidden in a tooltip.

### Motion only with a purpose

- Source: Motion, https://developer.apple.com/design/human-interface-guidelines/motion : "Add motion purposefully
  ... Don't add motion for the sake of adding motion"; "Aim for brevity and precision in feedback animations";
  "Make motion optional."
- **Finance document.** No motion.
- **Data app.** Motion is short feedback to the person's own action, and `prefers-reduced-motion` turns it off.

### Plain words

- Source: Writing: "Check each word to be sure it needs to be there. If you can use fewer words, do so"; "Choose
  simple, plain language ... avoiding jargon"; "avoid the temptation to be too cute or clever"; "Avoid using
  'Click here'"; error messages should "avoid blame, and be clear about what someone can do to fix it."
- **Finance document.** Short headings that state the finding. No marketing adjectives.
- **Data app.** Labels and buttons say the action. Errors say what is wrong and how to fix it, with no "Oops".

### Accessibility from the start

- Source: Accessibility, https://developer.apple.com/design/human-interface-guidelines/accessibility : contrast
  minimums taken from WCAG AA (4.5:1 up to 17 pt, 3:1 for larger or bold text); "Convey information with more
  than color alone"; reduce motion when the setting is on.
- **Both.** We already gate WCAG 2.2 AA in both themes; the HIG agrees and adds no stricter number.

## 2. What we adopt

| HIG principle | Our rule | Where |
|---|---|---|
| Simplicity, every element earns its place | "Simplicity" section; remove before adding | DESIGN.md |
| Simplicity, concise | Headings at most 12 words (gated; the number is our convention) | page gate `budget.headingWords` |
| Restraint, colour sparingly | At most one accent a view; state colours only for state | DESIGN.md, Don'ts |
| Charting data, keep a chart simple | No chart and table of the same numbers, except a table in an appendix | DESIGN.md, Don'ts |
| Charts, avoid subjective terms | Chart text and captions give values, not "rapidly" or "almost" | DESIGN.md, Don'ts |
| Motion, purposeful | No animation that is not feedback | DESIGN.md, Don'ts |
| Writing | No "click here", no interjections, no blame in errors | DESIGN.md, Don'ts |
| Typography, avoid light weights | No weights below regular (400) | DESIGN.md, Don'ts |

The budget numbers (seven sizes, six colours, box depth one, no border with background, twelve heading words)
are our convention. The HIG states the principle, not the numbers.

## 3. Where the HIG and our rules differ

| Topic | HIG | Ours | Resolution |
|---|---|---|---|
| Minimum text size | iOS minimum 11 pt, default 17 pt (Typography, Accessibility) | Running text at least 17 px | Keep the study (Rello, Pielot and Marcos 2016). The HIG minimum is for short UI labels, not for reading text |
| "we" in copy | "Avoid using *we* altogether because it may be unclear who the 'we' in question refers to" (Writing) | "Use 'you' and 'we'" | Adopt the HIG in apps: name the actor ("the lender sells"). In documents, "we" stays, because the masthead and the disclaimer name who "we" is, which removes the ambiguity the HIG warns about |
| Icon-only buttons | Allowed for familiar actions; "Consider using text when a short label communicates more clearly than an icon" (Buttons) | No icon without a visible label | Keep ours (owner's choice, stricter). No study either way |
| Prominent buttons | "one or two per view" (Buttons) | One primary button a view | Keep ours; it is inside the HIG range |
| Grouping | "negative space, container shapes, or separator lines" (Layout) | Rules and space; no containers | Keep ours (convention); the HIG allows our choice |
| Transitions | "use natural animations to ease transitions" (Design principles, Flexibility) | Motion only as feedback | A transition that follows the person's own action counts as feedback; nothing moves on its own |
| Button capitalisation | Title-style (Buttons); Writing: choose one style and keep it | Sentence case ("Get quote") | Keep ours; the Writing page accepts any style used consistently |
