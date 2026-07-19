import { ComponentProps } from "react";
import { round } from "ron-utils";

import { PositiveText } from "@/components/Text";
import { Part, Parts } from "./Parts";

export function Header({ label, children, ...rest }: ComponentProps<"span"> & { label: string }) {
  return (
    <span {...rest}>
      {label} <span className="text-heading font-semibold">{children}</span>
    </span>
  );
}

type RecordCritProps = {
  base: number;
  cDmg: number;
  result: number;
};

export function RecordCrit({ base, cDmg, result }: RecordCritProps) {
  return (
    <li>
      <Header label="Crit">{result}</Header> = <PositiveText>{base} *</PositiveText> (
      <PositiveText>1</PositiveText> <Part sign="+" label="Crit DMG" value={cDmg} />)
    </li>
  );
}

type RecordAverageProps = {
  base: number;
  cDmg: number;
  cRate: number;
  result: number;
};

export function RecordAverage({ base, cDmg, cRate, result }: RecordAverageProps) {
  return (
    <li>
      <Header label="Average">{result}</Header> = <PositiveText>{base} *</PositiveText> (
      <PositiveText>1</PositiveText>
      <Parts
        configs={[
          {
            sign: "+",
            label: "Crit DMG",
            value: cDmg,
          },
          {
            sign: "*",
            label: "Crit Rate",
            value: cRate,
            nullValue: null,
            process: (value) => round(value, 2),
          },
        ]}
      />
      )
    </li>
  );
}
