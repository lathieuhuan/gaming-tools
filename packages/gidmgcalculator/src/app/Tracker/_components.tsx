import type { ReactNode } from "react";

import { markGreen } from "@/components";

type HeadingProps = {
  children: ReactNode;
  extra?: string | number;
};

export function Heading({ children, extra }: HeadingProps) {
  return (
    <p className="font-medium">
      {children} <span className="text-heading">{extra}</span>
    </p>
  );
}

type RecordItemProps = {
  label: string;
  value: string | number;
  extraDesc?: string;
};

export function RecordItem({ label, value, extraDesc }: RecordItemProps) {
  return (
    <li className="text-light-hint text-sm">
      {label?.[0]?.toUpperCase()}
      {label.slice(1)} {extraDesc ? `${extraDesc} ` : ""}
      {markGreen(value)}
    </li>
  );
}

export function RecordContainer({ children }: { children: ReactNode }) {
  return <ul className="pl-4 list-disc">{children}</ul>;
}

type AnyRecord = {
  label: string;
  value: number;
};

type RecordListProps = {
  records: AnyRecord[];
  extraDesc?: (value: number) => string;
  calcFn?: (value: number) => string | number;
};

export function RecordList({ records, extraDesc, calcFn }: RecordListProps) {
  return (
    <RecordContainer>
      {records.map((record, index) => (
        <li key={index} className="text-light-hint text-sm">
          {record.label?.[0]?.toUpperCase()}
          {record.label.slice(1)} {extraDesc ? `${extraDesc(record.value)} ` : ""}
          {markGreen(calcFn ? calcFn(record.value) : record.value)}
        </li>
      ))}
    </RecordContainer>
  );
}
