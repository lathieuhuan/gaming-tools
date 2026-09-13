import type { ReactNode } from "react";
import { round } from "ron-utils";

import type { CalcReactionOutputs } from "@/logic/calculation";

import { useTranslation } from "@/hooks";
import { reactionCalcItemSubtitleParts } from "@/utils/ui.utils";
import { resultValue } from "./utils";

import { Parts, PartSpec, PartSpecType } from "./components/ResultParts";
import { Heading, RecordAverage, RecordCrit } from "./components/ResultRecord";

type ReactionItemTrackerProps = {
  title: string;
  item: CalcReactionOutputs;
  exclusiveRecord?: ReactNode;
  baseDMG: number;
};

export function ReactionItemTracker({
  title,
  item,
  baseDMG,
  exclusiveRecord,
}: ReactionItemTrackerProps) {
  const { t } = useTranslation();

  if (!item?.results[0]?.base) {
    return null;
  }

  const baseValue = resultValue(item.results, "base");
  const cDmg = item.cDmg ? round(item.cDmg, 3) : 0;
  const cRate = round(item.cRate, 2);

  let factorPartSpecs: PartSpecType[] = [];

  switch (item.subType) {
    case "nature":
      factorPartSpecs = [
        {
          sign: "*",
          label: "Base DMG",
          value: baseDMG,
        },
      ];
      break;
    case "direct": {
      const isMultiFactor = item.factors.length > 1;

      factorPartSpecs = item.factors
        .map<PartSpec[]>((factor, index) => [
          {
            sign: index === 0 && !isMultiFactor ? "*" : "+",
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

      if (isMultiFactor) {
        factorPartSpecs = [
          {
            sign: "*",
            containers: ["[", "]"],
            specs: factorPartSpecs,
          },
        ];
      }
      break;
    }
    default:
      item satisfies never;
  }

  const partSpecs: PartSpecType[] = [
    {
      containers: ["(", ")"],
      specs: [
        {
          sign: null,
          label: "Coefficient",
          value: item.coefficient,
        },
        ...factorPartSpecs,
        {
          sign: "*",
          label: "Base DMG Mult.",
          value: item.baseMult,
          nullValue: 1,
          process: (value) => `${round(value * 100, 2)}%`,
        },
        {
          sign: "*",
          label: "Base DMG Mult.",
          value: item.rxnBaseMult,
          nullValue: 1,
          process: (value) => `${round(value * 100, 2)}%`,
        },
        {
          sign: "*",
          label: "Bonus Mult.",
          value: item.bonusMult,
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
  ];

  return (
    <div>
      <p className="font-medium">{t(title)}</p>
      <div className="text-sm text-secondary-1">
        {reactionCalcItemSubtitleParts(item)
          .map((part) => t(part))
          .join(" / ")}
      </div>

      <ul className="mt-1 pl-4 text-light-hint text-sm leading-6 list-disc">
        {exclusiveRecord}

        <li>
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
