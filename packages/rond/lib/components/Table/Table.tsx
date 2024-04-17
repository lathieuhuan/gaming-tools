import clsx, { type ClassValue } from "clsx";
import type { ColHTMLAttributes, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import "./Table.styles.scss";

export interface TableProps extends Omit<TableHTMLAttributes<HTMLTableElement>, "className"> {
  className?: ClassValue;
  colAttrs?: (ColHTMLAttributes<HTMLTableColElement> | null)[];
}
const Table = ({ className, colAttrs, children, ...rest }: TableProps) => (
  <table className={clsx("ron-table", className)} {...rest}>
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

export interface TableTrProps extends Omit<HTMLAttributes<HTMLTableRowElement>, "className"> {
  className?: ClassValue;
}
Table.Tr = ({ className, ...rest }: TableTrProps) => <tr className={clsx("ron-table__tr", className)} {...rest} />;

export interface TableThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "className"> {
  className?: ClassValue;
}
Table.Th = ({ className, ...rest }: TableThProps) => <th className={clsx("ron-table__th", className)} {...rest} />;

export interface TableTdProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "className"> {
  className?: ClassValue;
}
Table.Td = ({ className, ...rest }: TableTdProps) => <td className={clsx("ron-table__td", className)} {...rest} />;

export { Table };
