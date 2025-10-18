import { ReactNode } from "react";
import { Radio, Table } from "rond";

import { SaveSelectionType } from "../types";

type SaveConfigProps = {
  name: string;
  value?: SaveSelectionType;
  label: ReactNode;
  overwritable?: boolean;
  onChange: (value: SaveSelectionType) => void;
};

export function SaveConfig({ name, value, label, overwritable, onChange }: SaveConfigProps) {
  const options: SaveSelectionType[] = ["IGNORE", "OVERWRITE", "NEW"];

  return (
    <Table.Tr>
      <Table.Td className="py-2 border-0 border-r border-dark-line">{label}</Table.Td>

      {options.map((option) => (
        <Table.Td key={option} className="border-0 border-l border-dark-line">
          <div className="flex-center">
            <Radio
              name={name}
              size="large"
              checked={value === option}
              disabled={!overwritable && option === "OVERWRITE"}
              onChange={() => onChange(option)}
            />
          </div>
        </Table.Td>
      ))}
    </Table.Tr>
  );
}
