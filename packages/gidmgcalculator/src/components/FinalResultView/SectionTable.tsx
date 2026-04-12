import { clsx, Table } from "rond";

import type { TalentType } from "@/types";
import type { GetRowConfig, HeaderConfig } from "./types";
import type { TableKey } from "./utils";

import { EMPTY_VALUE } from "@/constants/ui";

export type SectionTableProps = {
  tableKey: TableKey;
  talentType?: TalentType;
  label?: string;
  headerConfigs: HeaderConfig[];
  getRowConfig: GetRowConfig;
  getRowTitle: (key: string) => string;
};

export function SectionTable({
  label,
  talentType,
  headerConfigs,
  tableKey,
  getRowConfig,
  getRowTitle,
}: SectionTableProps) {
  return (
    <Table
      className="w-full"
      colAttrs={[
        {
          className: "w-34",
          style: { width: "8.5rem", minWidth: "6rem" },
        },
      ]}
      aria-label={label}
    >
      <Table.Tr>
        <Table.Th className="sticky left-0 z-10" style={{ background: "inherit" }} />

        {headerConfigs.map(({ content, ...attrs }, i) => {
          return (
            <Table.Th key={i} {...attrs}>
              {typeof content === "function" ? content(talentType) : content}
            </Table.Th>
          );
        })}
      </Table.Tr>

      {tableKey.subs.map((subKey) => {
        const config = getRowConfig(tableKey.main, subKey);
        const label = getRowTitle(subKey);

        return (
          <Table.Tr key={subKey} aria-label={label}>
            <Table.Td
              title={config.title}
              className={clsx("sticky left-0 z-10", config.className)}
              style={{ background: "inherit" }}
              onDoubleClick={config.onDoubleClick}
            >
              {label}
            </Table.Td>

            {config.cells.map(({ value, extra, ...rest }, cellIndex) => {
              return (
                <Table.Td key={cellIndex} {...rest}>
                  {value || EMPTY_VALUE}
                  {extra}
                </Table.Td>
              );
            })}
          </Table.Tr>
        );
      })}
    </Table>
  );
}
