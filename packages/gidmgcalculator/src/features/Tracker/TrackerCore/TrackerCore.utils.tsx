import type { ReactNode } from "react";
import { round } from "rond";
import { CalcStatRecord } from "@Backend";

import { Green } from "@Src/components";

export const recordListStyles = "columns-1 md:columns-2 space-y-1";

export function getTotalRecordValue(list: CalcStatRecord[]) {
  return round(
    list.reduce((accumulator, record) => accumulator + record.value, 0),
    2
  );
}

export function renderHeading(main: ReactNode, extra?: string | number) {
  return (
    <p className="font-medium">
      {main} <span className="text-heading-color">{extra}</span>
    </p>
  );
}

export function renderRecord(calcFn?: (value: number) => string | number, extraDesc?: (value: number) => string) {
  return ({ desc, value }: CalcStatRecord, index: number) =>
    value ? (
      <li key={index} className="text-hint-color text-sm">
        {desc?.[0]?.toUpperCase()}
        {desc.slice(1)} {extraDesc ? `${extraDesc(value)} ` : ""}
        <Green>{calcFn ? calcFn(value) : value}</Green>
      </li>
    ) : null;
}
