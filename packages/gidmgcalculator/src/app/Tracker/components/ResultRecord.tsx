import { ComponentProps } from "react";
import { round } from "ron-utils";

import type { AttackBonusControl } from "@/models/Character";
import type { TalentCalcItemBonusId } from "@/types";

import { useTranslation } from "@/hooks";
import { suffixOf } from "@/utils/pure.utils";

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
  id: TalentCalcItemBonusId;
  attkBonusCtrl: AttackBonusControl;
};
export function RecordExclusives({ id, attkBonusCtrl }: RecordExclusivesProps) {
  const { t } = useTranslation();

  const exclusiveBonuses = attkBonusCtrl.collectExclusiveBonuses(id);

  if (exclusiveBonuses.length === 0) {
    return null;
  }

  return (
    <li>
      <p className="text-primary-1">Exclusive Bonus</p>
      {exclusiveBonuses.map((bonus, i) => {
        const percent = suffixOf(bonus.type);

        return bonus.items.map((bonusItem, j) => (
          <p key={i + j}>
            + {t(bonus.type)}: {bonusItem.label}{" "}
            <PositiveText>{round(bonusItem.value, percent ? 2 : 0) + percent}</PositiveText>
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
