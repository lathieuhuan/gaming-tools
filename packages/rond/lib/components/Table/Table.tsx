import type { ClassValue } from "clsx";
import type {
  ColHTMLAttributes,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@lib/utils";

export type TableProps = Omit<TableHTMLAttributes<HTMLTableElement>, "className"> & {
  className?: ClassValue;
  colAttrs?: (ColHTMLAttributes<HTMLTableColElement> | null)[];
};

const Table = ({ className, colAttrs, children, ...rest }: TableProps) => (
  <table className={cn("min-w-full border-collapse text-white", className)} {...rest}>
    {colAttrs?.length ? (
      <colgroup>
        {colAttrs.map((attrs, i) => (
          <col key={i} {...attrs} />
        ))}
      </colgroup>
    ) : null}
    <tbody>{children}</tbody>
  </table>
);

export type TableTrProps = Omit<HTMLAttributes<HTMLTableRowElement>, "className"> & {
  className?: ClassValue;
};
Table.Tr = ({ className, ...rest }: TableTrProps) => (
  <tr
    className={cn(
      "odd:bg-dark-1 even:bg-dark-2 hover:bg-table-row-hover first:!bg-dark-0",
      className
    )}
    {...rest}
  />
);

export type TableThProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "className"> & {
  className?: ClassValue;
};
Table.Th = ({ className, ...rest }: TableThProps) => (
  <th
    className={cn(
      "px-2 py-1 text-sm border-l border-r border-dark-1 cursor-default font-semibold",
      className
    )}
    {...rest}
  />
);

export type TableTdProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, "className"> & {
  className?: ClassValue;
};
Table.Td = ({ className, ...rest }: TableTdProps) => (
  <td
    className={cn(
      "px-2 py-1 text-sm border-l border-r border-dark-1 cursor-default first:font-semibold",
      className
    )}
    {...rest}
  />
);

export { Table };
