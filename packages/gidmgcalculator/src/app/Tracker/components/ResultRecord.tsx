import { ComponentProps } from "react";
import { round } from "ron-utils";

import type { AttackBonusControl } from "@/models/Character";

import { useTranslation } from "@/hooks";
import { suffixOf } from "@/utils/ui.utils";

import { PositiveText } from "@/components/Text";
import { Part, Parts } from "./ResultParts";

export function Heading({ label, children, ...rest }: ComponentProps<"span"> & { label: string }) {
  return (
    <span {...rest}>
      {label} <span className="text-heading font-semibold">{children}</span>
    </span>
  );
}

type RecordExclusivesProps = {
  bonusGroups: ReturnType<AttackBonusControl["exclusiveGroups"]>;
};

export function RecordExclusives({ bonusGroups }: RecordExclusivesProps) {
  const { t } = useTranslation();

  if (bonusGroups.length === 0) {
    return null;
  }

  return (
    <li>
      <p className="text-primary-1">Exclusive Bonus</p>
      {bonusGroups.map((group, i) => {
        const percent = suffixOf(group.type);

        return group.items.map((bonusItem, j) => (
          <p key={i + j}>
            + {t(group.type)}: {bonusItem.label}{" "}
            <PositiveText>
              {round(bonusItem.value, percent ? 2 : 0)}
              {percent}
            </PositiveText>
          </p>
        ));
      })}
    </li>
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
      <Heading label="Crit">{result}</Heading> = <PositiveText>{base} *</PositiveText> (
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
      <Heading label="Average">{result}</Heading> = <PositiveText>{base} *</PositiveText> (
      <PositiveText>1</PositiveText>
      <Parts
        specs={[
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
