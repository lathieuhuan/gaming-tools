import { ReactNode } from "react";
import { StatsTable, StatsTableRowProps } from "rond";

const { Row, Cell } = StatsTable;

type CoreStatRowProps = StatsTableRowProps & {
  label: string;
  total: number;
  base?: number;
  renderValue: (total: number, bonus?: number) => ReactNode;
};

export function CoreStatRow({ label, total, base, renderValue, ...props }: CoreStatRowProps) {
  const roundedTotal = Math.round(total);
  const bonus = base === undefined ? undefined : roundedTotal - Math.round(base);

  return (
    <Row aria-label={label} {...props}>
      <Cell>{label}</Cell>
      <Cell className="relative">{renderValue(roundedTotal, bonus)}</Cell>
    </Row>
  );
}
