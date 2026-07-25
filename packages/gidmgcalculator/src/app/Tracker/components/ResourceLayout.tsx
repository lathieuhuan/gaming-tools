import type { ReactNode } from "react";

import { PositiveText } from "@/components/Text";

type HeadingProps = {
  label: ReactNode;
  value: string | number;
};
export function Heading({ label, value }: HeadingProps) {
  return (
    <p className="font-medium">
      {label} <span className="text-heading">{value}</span>
    </p>
  );
}

type ItemProps = {
  label: string;
  value: string | number;
};
export function Item({ label, value }: ItemProps) {
  return (
    <li className="text-light-hint text-sm">
      {label} <PositiveText>{value}</PositiveText>
    </li>
  );
}

export function Container({ children }: { children: ReactNode }) {
  return <ul className="pl-4 list-disc">{children}</ul>;
}

type AnyRecord = {
  label: string;
  value: number;
};

type ListProps = {
  records: AnyRecord[];
  calcFn?: (value: number) => string | number;
};

export function List({ records, calcFn }: ListProps) {
  return (
    <Container>
      {records.map((record, index) => (
        <Item
          key={index}
          label={record.label}
          value={calcFn ? calcFn(record.value) : record.value}
        />
      ))}
    </Container>
  );
}
