import { DataTable, Diff } from "@kcc/design";

type Row = { scenario: string; capToday: string; capSoft: string; diff: string; tone: "up" | "down"; liqToday: number; liqSoft: number };

const rows: Row[] = [
  { scenario: "Real CC history (replay)", capToday: "$800k", capSoft: "$880k", diff: "+10%", tone: "up", liqToday: 0, liqSoft: 0 },
  { scenario: "CC −30% in one day", capToday: "$600k", capSoft: "$510k", diff: "−15%", tone: "down", liqToday: 20, liqSoft: 0 },
  { scenario: "Worst week, twice", capToday: "$600k", capSoft: "$750k", diff: "+25%", tone: "up", liqToday: 30, liqSoft: 20 },
];

export default function Demo() {
  return (
    <DataTable
      label="Borrower capacity and liquidations by scenario, today and with software parameters"
      rows={rows}
      rowKey={(r) => r.scenario}
      rowHeader={(r) => r.scenario}
      rowHeaderLabel="Scenario"
      groups={[
        { label: "", span: 1 },
        { label: "Borrower capacity", span: 2 },
        { label: "Liquidations", span: 2 },
      ]}
      columns={[
        { header: "Today", cell: (r) => r.capToday },
        { header: "Software", cell: (r) => <>{r.capSoft} <Diff tone={r.tone}>{r.diff}</Diff></> },
        { header: "Today", cell: (r) => r.liqToday },
        { header: "Software", cell: (r) => r.liqSoft },
      ]}
      caption="Sample data. Means over the scenario path, simulated. Green: better for borrowers; red: worse. The sign says the same."
    />
  );
}
