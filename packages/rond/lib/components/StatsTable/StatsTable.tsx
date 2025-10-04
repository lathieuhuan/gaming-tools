import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";

export type StatsTableProps = React.AriaAttributes & {
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

function StatsTable({ className, style, children, ...rest }: StatsTableProps) {
  return (
    <div
      className={cn("w-full text-white cursor-default", className)}
      style={style}
      role="table"
      {...rest}
    >
      {children}
    </div>
  );
}

export type StatsTableRowProps = React.AriaAttributes & {
  className?: ClassValue;
  children?: React.ReactNode;
  role?: React.AriaRole;
  onClick?: () => void;
};

StatsTable.Row = ({ className, children, onClick, ...rest }: StatsTableRowProps) => {
  return (
    <div
      className={cn(
        "px-2 py-1 flex justify-between hover:bg-table-row-hover [&>*:first-child]:font-medium odd:bg-dark-2 even:bg-dark-1",
        className
      )}
      onClick={onClick}
      role="row"
      {...rest}
    >
      {children}
    </div>
  );
};

export type StatsTableCellProps = React.HTMLAttributes<HTMLDivElement> &
  React.AriaAttributes & {
    role?: React.AriaRole;
  };

StatsTable.Cell = (props: StatsTableCellProps) => {
  return <div role="cell" {...props} />;
};

export { StatsTable };
