import type { ComponentProps } from "react";
import type { ClassValue } from "clsx";

import { cn } from "@lib/utils";

export type StatsTableProps = ComponentProps<"div"> & {
  className?: ClassValue;
};

function StatsTable({ className, ...rest }: StatsTableProps) {
  return (
    <div className={cn("w-full text-white cursor-default", className)} role="table" {...rest} />
  );
}

export type StatsTableRowProps = ComponentProps<"div"> & {
  className?: ClassValue;
};

StatsTable.Row = ({ className, ...rest }: StatsTableRowProps) => {
  return (
    <div
      className={cn(
        "px-2 py-1 flex justify-between hover:bg-table-row-hover [&>*:first-child]:font-medium odd:bg-dark-2 even:bg-dark-1",
        className,
      )}
      role="row"
      {...rest}
    />
  );
};

export type StatsTableCellProps = ComponentProps<"div">

StatsTable.Cell = (props: StatsTableCellProps) => {
  return <div role="cell" {...props} />;
};

export { StatsTable };
