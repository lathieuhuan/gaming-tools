import clsx, { type ClassValue } from "clsx";
import "./StatsTable.styles.scss";

export interface StatsTableProps extends React.AriaAttributes {
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode;
}
function StatsTable({ className, style, children, ...rest }: StatsTableProps) {
  return (
    <div className={clsx("ron-stats-table", className)} style={style} role="table" {...rest}>
      {children}
    </div>
  );
}

export interface StatsTableRowProps extends React.AriaAttributes {
  className?: ClassValue;
  children?: React.ReactNode;
  role?: React.AriaRole;
  onClick?: () => void;
}
StatsTable.Row = ({ className, children, onClick, ...rest }: StatsTableRowProps) => {
  return (
    <div className={clsx("ron-stats-table__row", className)} onClick={onClick} role="row" {...rest}>
      {children}
    </div>
  );
};

export interface StatsTableCellProps extends React.HTMLAttributes<HTMLDivElement>, React.AriaAttributes {
  role?: React.AriaRole;
}
StatsTable.Cell = (props: StatsTableCellProps) => {
  return <div role="cell" {...props} />;
};

export { StatsTable };
