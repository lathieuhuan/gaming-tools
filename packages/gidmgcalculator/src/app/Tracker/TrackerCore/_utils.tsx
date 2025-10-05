import type { ReactNode } from "react";
import { round } from "rond";
import { CalcAtomicRecord } from "@Calculation";

import { markGreen } from "@/components";

export const recordListStyles = "columns-1 md:columns-2 space-y-1";

export function getTotalRecordValue(list: Array<{ value: number }>) {
  return round(
    list.reduce((accumulator, record) => accumulator + record.value, 0),
    2
  );
}

export function renderHeading(main: ReactNode, extra?: string | number) {
  return (
    <p className="font-medium">
      {main} <span className="text-heading">{extra}</span>
    </p>
  );
}

export function renderRecord(calcFn?: (value: number) => string | number, extraDesc?: (value: number) => string) {
  return ({ description, value }: CalcAtomicRecord, index: number) =>
    value ? (
      <li key={index} className="text-light-hint text-sm">
        {description?.[0]?.toUpperCase()}
        {description.slice(1)} {extraDesc ? `${extraDesc(value)} ` : ""}
        {markGreen(calcFn ? calcFn(value) : value)}
      </li>
    ) : null;
}
