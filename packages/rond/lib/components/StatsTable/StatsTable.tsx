import clsx, { type ClassValue } from "clsx";
import type { CSSProperties, ReactNode } from "react";
import "./styles.scss";

export interface StatsTableProps {
  className?: ClassValue;
  style?: CSSProperties;
  children: ReactNode;
}
const StatsTable = ({ className, style, children }: StatsTableProps) => {
  return (
    <div className={clsx("ron-stats-table", className)} style={style}>
      {children}
    </div>
  );
};

interface RowProps {
  className?: ClassValue;
  children: ReactNode;
  onClick?: () => void;
}
StatsTable.Row = ({ className, children, onClick }: RowProps) => {
  return (
    <div className={clsx("ron-stats-table-row", className)} onClick={onClick}>
      {children}
    </div>
  );
};

export { StatsTable };
