import type { ReactNode } from "react";
import { round } from "ron-utils";

import type { CalcAttackItemOutputs } from "@/logic/calculation";

import { attackCalcItemSubtitleParts } from "@/components/FinalResultView/utils";
import { useTranslation } from "@/hooks";
import { resultValue } from "./utils";

import { Parts, PartSpec, PartSpecType } from "./components/ResultParts";
import { Heading, RecordAverage, RecordCrit } from "./components/ResultRecord";

type AttackItemTrackerProps = {
  title: string;
  item: CalcAttackItemOutputs;
  exclusiveRecord?: ReactNode;
};

export function AttackItemTracker({ title, item, exclusiveRecord }: AttackItemTrackerProps) {
  const { t } = useTranslation();

  const baseValue = resultValue(item.results, "base");
  const cDmg = round(item.cDmg, 3);
  const cRate = round(item.cRate, 2);

  const subtitle = attackCalcItemSubtitleParts(item)
    .map((part) => t(part))
    .join(" / ");

  const factorParts = item.factors
    .map<PartSpec[]>((factor, index) => [
      {
        sign: index === 0 ? null : "+",
        label: "Talent Mult.",
        value: factor.multiplier,
        process: (value) => `${round(value, 2)}%`,
      },
      {
        sign: "*",
        label: t(factor.basedOnAttr),
        value: factor.basedOnValue,
        nullValue: -1,
        process: Math.round,
      },
    ])
    .flat();

  const partSpecs: PartSpecType[] = [
    {
      containers: ["(", ")"],
      specs: [
        ...factorParts,
        {
          sign: "*",
          label: "Base DMG Mult.",
          value: item.baseMult,
          nullValue: 1,
          process: (value) => `${round(value * 100, 2)}%`,
        },
        {
          sign: "+",
          label: "Flat Bonus",
          value: item.flat,
          process: Math.round,
        },
      ],
    },
    {
      sign: "*",
      label: "Bonus Mult.",
      value: item.bonusMult,
      process: (value) => `${round(value * 100, 2)}%`,
    },
    {
      sign: "*",
      label: "Elevate Mult.",
      value: item.elvMult,
      nullValue: 1,
      process: (value) => `${round(value * 100, 2)}%`,
    },
    {
      sign: "*",
      label: "Reaction Mult.",
      value: item.rxnMult,
      nullValue: 1,
      process: (value) => round(value, 3),
    },
    {
      sign: "*",
      label: "RES Mult.",
      value: item.resMult,
    },
    {
      sign: "*",
      label: "DEF Mult.",
      value: item.defMult,
      process: (value) => round(value, 3),
    },
  ];

  return (
    <div>
      <p className="font-medium">{title}</p>
      <div className="text-sm text-secondary-1">{subtitle}</div>

      <ul className="pl-4 text-light-hint text-sm leading-6 list-disc">
        {exclusiveRecord}

        <li className="mt-1">
          <Heading label="Non-crit">{baseValue}</Heading> = <Parts specs={partSpecs} />
        </li>

        {cDmg !== 0 && (
          <RecordCrit result={resultValue(item.results, "crit")} base={baseValue} cDmg={cDmg} />
        )}

        {cDmg !== 0 && cRate !== 0 && (
          <RecordAverage
            result={resultValue(item.results, "average")}
            base={baseValue}
            cDmg={cDmg}
            cRate={cRate}
          />
        )}
      </ul>
    </div>
  );
}
