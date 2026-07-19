import { round } from "ron-utils";

import type { CalcResultAttackItem } from "@/calculation/types";
import type { AttackBonusControl } from "@/models/Character";

import { attackCalcItemSubtitleParts } from "@/components/FinalResultView/utils";
import { useTranslation } from "@/hooks";
import { resultValue } from "./utils";

import { Parts, PartSpec, PartSpecType } from "./components/ResultParts";
import { Heading, RecordAverage, RecordCrit, RecordExclusives } from "./components/ResultRecord";

type AttackItemTrackerProps = {
  title: string;
  item: CalcResultAttackItem;
  attkBonusCtrl: AttackBonusControl;
};

export function AttackItemTracker({ title, item, attkBonusCtrl }: AttackItemTrackerProps) {
  const { t } = useTranslation();

  const data = item.recorder.data;
  const baseValue = resultValue(item.values, "base");
  const cDmg = data.cDmg_ ? round(data.cDmg_, 3) : 0;

  const subtitle = attackCalcItemSubtitleParts(item)
    .map((part) => t(part))
    .join(" / ");

  const factorParts = data.factors
    .map<PartSpec[]>((factor, index) => [
      {
        sign: index ? "+" : null,
        label: "Talent Mult.",
        value: factor.mult,
        process: (value) => `${round(value, 2)}%`,
      },
      {
        sign: "*",
        label: t(factor.label),
        value: factor.value,
        nullValue: -1,
        process: Math.round,
      },
    ])
    .flat();

  const baseMult: PartSpec = {
    sign: "*",
    label: "Base DMG Mult.",
    value: data.baseMult,
    nullValue: 1,
    process: (value) => `${round(value * 100, 2)}%`,
  };
  const flat: PartSpec = {
    sign: "+",
    label: "Flat Bonus",
    value: data.flat,
    process: Math.round,
  };

  const bonusMult: PartSpec = {
    sign: "*",
    label: "Bonus Mult.",
    value: data.bonusMult,
    process: (value) => `${round(value * 100, 2)}%`,
  };

  let headBasePartSpecs: PartSpecType[];

  if (data.coefficient !== undefined) {
    headBasePartSpecs = [
      {
        containers: ["(", ")"],
        specs: [
          {
            sign: null,
            label: "Coefficient",
            value: data.coefficient,
            nullValue: 1,
          },
          ...factorParts,
          baseMult,
          {
            sign: "*",
            label: "Reaction Base Mult.",
            value: data.rxnBaseMult,
            nullValue: 1,
            process: (value) => `${round(value * 100, 2)}%`,
          },
          bonusMult,
          flat,
        ],
      },
    ];
  } else {
    headBasePartSpecs = [
      {
        containers: ["(", ")"],
        specs: [...factorParts, baseMult, flat],
      },
      bonusMult,
    ];
  }

  const tailBasePartSpecs: PartSpecType[] = [
    {
      sign: "*",
      label: "Elevate Mult.",
      value: data.elvMult,
      nullValue: 1,
      process: (value) => `${round(value * 100, 2)}%`,
    },
    {
      sign: "*",
      label: "Reaction Mult.",
      value: data.rxnMult,
      nullValue: 1,
      process: (value) => round(value, 3),
    },
    {
      sign: "*",
      label: "RES Mult.",
      value: data.resMult,
    },
    {
      sign: "*",
      label: "DEF Mult.",
      value: data.defMult,
      process: (value) => round(value, 3),
    },
  ];

  return (
    <div>
      <p className="font-medium">{title}</p>
      <div className="text-sm text-secondary-1">{subtitle}</div>

      <ul className="pl-4 text-light-hint text-sm leading-6 list-disc">
        {item.exclusiveBonusId !== undefined && (
          <RecordExclusives id={item.exclusiveBonusId} attkBonusCtrl={attkBonusCtrl} />
        )}

        <li className="mt-1">
          <Heading label="Non-crit">{baseValue}</Heading> ={" "}
          <Parts specs={[...headBasePartSpecs, ...tailBasePartSpecs]} />
          {data.note}
        </li>

        {cDmg !== 0 && (
          <RecordCrit result={resultValue(item.values, "crit")} base={baseValue} cDmg={cDmg} />
        )}

        {cDmg !== 0 && data.cRate_ !== undefined && (
          <RecordAverage
            result={resultValue(item.values, "average")}
            base={baseValue}
            cDmg={cDmg}
            cRate={data.cRate_}
          />
        )}
      </ul>
    </div>
  );
}
