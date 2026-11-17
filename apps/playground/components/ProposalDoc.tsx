import type { ReactNode } from "react";
import {
  Callout,
  DataTable,
  Diff,
  DivergingBars,
  Figures,
  Flow,
  Footer,
  ListBlock,
  Masthead,
  Note,
  PageTitle,
  Phases,
  Section,
  TwoColumns,
  shownZero,
  signedPct,
} from "@kcc/design";


type Money = { item: string; today: string; soft: string; change: string; tone?: "up" | "down" };
// Sample data: a fictional pool ("Example Lending Pool", run by "Northwind Capital") with round, invented numbers.
const perYear: Money[] = [
  { item: "Interest paid by borrowers", today: "$100k", soft: "$110k", change: "+$10k (+10%)", tone: "up" },
  { item: "Interest earned by suppliers", today: "$90k", soft: "$99k", change: "+$9k (+10%)", tone: "up" },
  { item: "Protocol spread (reserve factor)", today: "$10k", soft: "$11k", change: "+$1k (+10%)", tone: "up" },
  { item: "Protocol share of liquidation bonuses", today: "$3k", soft: "$2k", change: "−$1k", tone: "down" },
  { item: "Room for borrowers (mean capacity)", today: "$1.0M", soft: "$1.1M", change: "+$100k (+10%)", tone: "up" },
  { item: "Bad debt", today: "$0", soft: "$0", change: "no change" },
  { item: "Time to tighten after a −30% day", today: "48 h", soft: "24 h", change: "24 h sooner", tone: "up" },
];
const stress: Money[] = [
  { item: "One borrower with 40% of the debt, −40% day", today: "$50k", soft: "$30k", change: "−40%", tone: "up" },
  { item: "Volatile sideways market (3× normal)", today: "$40k", soft: "$20k", change: "−50%", tone: "up" },
  { item: "Slow slide, −60% over 30 days", today: "$30k", soft: "$20k", change: "−33%", tone: "up" },
  { item: "Plain −30% day", today: "$5k", soft: "$0", change: "no liquidations", tone: "up" },
];

type Scenario = { s: string; capT: string; capS: string; d: number; liq: [number, number]; time: [string, string] };
const scenarios: Scenario[] = [
  { s: "Real CC history (replay)", capT: "$800k", capS: "$840k", d: 5, liq: [0, 0], time: ["—", "—"] },
  { s: "500 resampled paths (held out)", capT: "$1.0M", capS: "$1.1M", d: 10, liq: [200, 198], time: ["—", "—"] },
  { s: "CC −30% in one day", capT: "$600k", capS: "$510k", d: -15, liq: [20, 0], time: ["48 h", "24 h"] },
  { s: "CC −50% over 3 days", capT: "$400k", capS: "$420k", d: 5, liq: [150, 140], time: ["72 h", "24 h"] },
  { s: "CC −50% over 7 days", capT: "$500k", capS: "$575k", d: 15, liq: [150, 140], time: ["100 h", "96 h"] },
  { s: "Worst week, twice", capT: "$600k", capS: "$750k", d: 25, liq: [30, 20], time: ["300 h", "240 h"] },
  { s: "CC −30% gap in one hour", capT: "$600k", capS: "$600k", d: 0, liq: [30, 0], time: ["48 h", "1 h"] },
  { s: "Order-book depth at its 5th percentile", capT: "$900k", capS: "$1.08M", d: 20, liq: [0, 0], time: ["—", "—"] },
  { s: "Oracle stale during a −30% day", capT: "$600k", capS: "$510k", d: -15, liq: [30, 15], time: ["48 h", "24 h"] },
  { s: "Oracle prints 1.5× too high", capT: "$800k", capS: "$1.0M", d: 25, liq: [10, 40], time: ["48 h", "—"] },
  { s: "Oracle prints too low", capT: "$800k", capS: "$960k", d: 20, liq: [40, 40], time: ["48 h", "—"] },
];

const moneyColumns = [
  { header: "Today", cell: (r: Money) => r.today },
  { header: "With software parameters", cell: (r: Money) => r.soft },
  { header: "Change", cell: (r: Money) => (r.tone ? <Diff tone={r.tone}>{r.change}</Diff> : r.change) },
];

/** A pilot proposal for a fictional pool, with sample data. Used by the example page and the one-page proposal template. */
export function ProposalDoc({ stamp }: { stamp?: ReactNode }) {
  return (
    <article style={{ marginTop: 34 }}>
      <Masthead left="KC&C · Canton Coin data" right="Pilot proposal · 17 November 2026" />
      {stamp}
      <PageTitle
        title="A risk parameter pilot for the Example Lending Pool"
        lede="As we understand it, Northwind Capital sets the pool’s CC risk parameters by hand and prices CC from one oracle feed. We simulated the same pool twice on the same price paths: once as it runs today, once with parameters updated by software inside bounds Northwind sets. This page shows the results and proposes a four-week pilot."
      >
        <div style={{ marginTop: 21 }}>
          <Callout label="Scope">
            <p>
              CC used as collateral to borrow dollars (the USD stablecoin pools are modelled as one debt pool). Other collateral is not simulated here.
              All figures on this page are sample data for the design system: the pool, its operator and the numbers are invented.
            </p>
          </Callout>
        </div>
      </PageTitle>

      <Section id="p-year" eyebrow="What it means for the pool, per year: CC collateral" title="A bigger, busier pool at the same risk">
        <DataTable label="Per year, simulated pool, today and with software parameters" rows={perYear} rowKey={(r) => r.item} rowHeader={(r) => r.item} rowHeaderLabel="Per year, simulated pool" columns={moneyColumns} />
        <DataTable
          label="Stress scenarios: collateral borrowers lose to liquidation bonuses"
          rows={stress}
          rowKey={(r) => r.item}
          rowHeader={(r) => r.item}
          rowHeaderLabel="Stress scenario: collateral your borrowers lose to liquidation bonuses"
          columns={moneyColumns}
        />
        <Note>
          Means over 500 held-out price paths for the first table, single scenarios for the second. The protocol&apos;s own cash (spread plus liquidation share)
          stays about the same; the gain shows up as more lending, more income for suppliers and smaller losses for borrowers in a crash. Figures exclude CC
          supply incentives and use the same reserve factor.
        </Note>
      </Section>

      <Section id="p-result" eyebrow="Result on 500 held-out paths" title="More room to borrow, the same number of liquidations, no bad debt">
        <Figures
          items={[
            { value: "+10%", label: "borrower capacity", basis: "mean over the path" },
            { value: "200 → 198", label: "liquidations per path", basis: "difference within noise" },
            { value: "8.0% → 8.8%", label: "supplier yield", basis: "a year" },
            { value: "0 → 0", label: "bad debt", basis: "in every scenario we ran" },
          ]}
        />
        <p className="kc-muted">
          The software settings were fixed before the run and checked on paths 0–499. These figures come from paths 500–999, which were not used for tuning.
        </p>
      </Section>

      <Section id="p-every" eyebrow="Every scenario" title="Change in borrower capacity with software parameters">
        <DivergingBars
          label="Change in borrower capacity with software parameters, by scenario, percent"
          rows={scenarios.map((s) => ({ label: s.s, value: s.d }))}
          format={(v) => signedPct(v)}
          caption="Simulated. Bars right of zero: more capacity than today."
        />
        <p className="kc-muted">
          Capacity falls in a sharp one-day crash because the software tightens within 24 hours, where a manual change took 48 hours in our assumptions for the
          same crash. That is the intended trade: less new borrowing while CC is falling.
        </p>
        <DataTable
          label="Every scenario: capacity, liquidations and time to first tightening"
          rows={scenarios}
          rowKey={(r) => r.s}
          rowHeader={(r) => r.s}
          rowHeaderLabel="Scenario"
          groups={[
            { label: "", span: 1 },
            { label: "Borrower capacity", span: 2 },
            { label: "Liquidations", span: 2 },
            { label: "Time to first tightening", span: 2 },
          ]}
          columns={[
            { header: "Today", cell: (r) => r.capT },
            { header: "Software", cell: (r) => <>{r.capS} <Diff tone={shownZero(signedPct(r.d)) ? "neutral" : r.d > 0 ? "up" : "down"}>{signedPct(r.d)}</Diff></> },
            { header: "Today", cell: (r) => r.liq[0] },
            { header: "Software", cell: (r) => r.liq[1] },
            { header: "Today", cell: (r) => r.time[0] },
            { header: "Software", cell: (r) => r.time[1] },
          ]}
        />
      </Section>

      <Section id="p-health" eyebrow="Pool health, public data" title="Two things we would watch first">
        <TwoColumns>
          <div>
            <h3 className="kc-h3">The stablecoin pool is nearly fully lent</h3>
            <p>On 1 November the stablecoin pool was 85% utilised, with about $100k free to withdraw.</p>
          </div>
          <div>
            <h3 className="kc-h3">CC collateral is large next to market depth</h3>
            <p>About 20M CC was supplied. At its weakest last week, CC order books absorbed about 15M CC within 2% of the price.</p>
          </div>
        </TwoColumns>
        <Note>Source: the pool&apos;s public endpoint (snapshot 1 Nov 2026, 00:00 UTC) and KC&amp;C order-book data. Sample data.</Note>
      </Section>

      <Section id="p-how" eyebrow="How it works" title="You keep control of every value">
        <Flow
          label="How a parameter update travels"
          steps={[
            { title: "KC&C", body: "Computes parameters each hour from CC volatility and order-book depth, under a public method." },
            { title: "Signed report", body: "Sent to your receiver. Loosening needs two separate KC&C keys. Tightening needs one." },
            { title: "Your receiver", body: "Checks the signature on ledger and applies only values inside your minimum, maximum and step.", yours: true },
            { title: "Your pool", body: "Reads the applied values. Your oracle stays your price.", yours: true },
          ]}
        />
        <ul className="kc-list">
          <li>KC&amp;C is never a party to your transactions, so our node receives none of your users&apos; positions.</li>
          <li>Even with both of our keys stolen, no value can leave your bounds or move faster than your step.</li>
          <li>You can pause the feed or set values by hand at any time.</li>
        </ul>
      </Section>

      <Section id="p-proposal" eyebrow="Proposal" title="Four weeks in shadow, then your decision">
        <Phases
          items={[
            { when: "Week 0", what: "Call to agree scope, bounds and the data you can share." },
            { when: "Weeks 1–4", what: "Shadow run. Daily parameters and a weekly note. Nothing touches your pool." },
            { when: "Weeks 2–4", what: "Joint calibration on your position distribution and liquidation history." },
            { when: "Week 4", what: "Test receiver on a test network, with your bounds." },
            { when: "After", what: "You decide whether to apply the values in production." },
          ]}
        />
        <TwoColumns>
          <ListBlock title="What we would ask for" items={["Your parameter change history and the reasons.", "An aggregate view of positions by health factor.", "Past liquidations: size, bonus, time to fill.", "Your price feed settings."]} />
          <ListBlock title="What you get" items={["Parameters checked every hour against market depth.", "A second price check against the single feed.", "Simulations on your own book.", "A method you can cite to suppliers and auditors."]} />
        </TwoColumns>
      </Section>

      <Footer>
        <p>
          Method: a pool of this shape simulated hour by hour from public data only and KC&amp;C market data. Borrower behaviour and the manual operator&apos;s
          delay are our assumptions. Sample data: the pool, its operator and every figure on this page are invented for the design system.
        </p>
        <p>KC&amp;C publishes data and does not lend. Simulation results are not a forecast.</p>
      </Footer>
    </article>
  );
}
