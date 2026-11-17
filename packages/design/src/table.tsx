import type { ReactNode } from "react";
import { cx } from "./cx";

export type Column<T> = {
  /** Column header text. */
  header: ReactNode;
  /** Cell content for a row. */
  cell: (row: T) => ReactNode;
  /** Left-align (text). Numbers are right-aligned by default. */
  text?: boolean;
};

export type ColumnGroup = { label: ReactNode; span: number };

/**
 * A data table. The first column is the row header (scope="row"), the rest are numbers, right-aligned, tabular.
 * `groups` adds a header row above the column headers (the first group usually spans the row-header column with an
 * empty label). The wrapper scrolls sideways on narrow screens and can take keyboard focus.
 */
export function DataTable<T>({
  label,
  rows,
  rowKey,
  rowHeader,
  rowHeaderLabel,
  columns,
  groups,
  caption,
  dense,
  total,
}: {
  /** Accessible name of the scroll region: what the table shows. */
  label: string;
  rows: readonly T[];
  rowKey: (row: T, i: number) => string;
  rowHeader: (row: T) => ReactNode;
  rowHeaderLabel: ReactNode;
  columns: Column<T>[];
  groups?: ColumnGroup[];
  caption?: ReactNode;
  dense?: boolean;
  /** A last row drawn under an ink rule. */
  total?: T;
}) {
  const body = (r: T, i: number, isTotal = false) => (
    <tr key={isTotal ? "total" : rowKey(r, i)} className={isTotal ? "kc-total" : undefined}>
      <th scope="row">{rowHeader(r)}</th>
      {columns.map((c, j) => (
        <td key={j} className={c.text ? "kc-l" : undefined}>
          {c.cell(r)}
        </td>
      ))}
    </tr>
  );
  return (
    <div className="kc-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table className={cx("kc-table", dense && "kc-table--dense")}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          {groups ? (
            <tr className="kc-group">
              {groups.map((g, i) => (
                <th key={i} colSpan={g.span} scope={g.label ? "colgroup" : undefined}>
                  {g.label}
                </th>
              ))}
            </tr>
          ) : null}
          <tr>
            <th scope="col">{rowHeaderLabel}</th>
            {columns.map((c, j) => (
              <th key={j} scope="col" className={c.text ? "kc-l" : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => body(r, i))}
          {total ? body(total, rows.length, true) : null}
        </tbody>
      </table>
    </div>
  );
}
