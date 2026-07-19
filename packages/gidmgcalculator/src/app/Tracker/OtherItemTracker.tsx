import { round } from "ron-utils";

import type { CalcResultOtherItem } from "@/calculation/types";
import type { AttackBonusControl } from "@/models/Character";

import { useTranslation } from "@/hooks";
import { resultValue } from "./utils";

import { Parts, PartSpec, PartSpecType } from "./components/ResultParts";
import { Heading, RecordExclusives } from "./components/ResultRecord";

type OtherItemTrackerProps = {
  title: string;
  item: CalcResultOtherItem;
  attkBonusCtrl: AttackBonusControl;
};

export function OtherItemTracker({ title, item, attkBonusCtrl }: OtherItemTrackerProps) {
  const { t } = useTranslation();

  const data = item.recorder.data;
  const baseValue = resultValue(item.values, "base");

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

  const basePartSpecs: PartSpecType[] = [
    {
      containers: ["(", ")"],
      specs: [
        ...factorParts,
        {
          sign: "+",
          label: "Flat Bonus",
          value: data.flat,
          process: Math.round,
        },
      ],
    },
    {
      sign: "*",
      label: "Bonus Mult.",
      value: data.bonusMult,
      process: (value) => `${round(value * 100, 2)}%`,
    },
    {
      sign: "*",
      label: "Incoming Heal Mult.",
      value: data.inhealMult,
      nullValue: 1,
    },
  ];

  return (
    <div>
      <p className="font-medium">{title}</p>

      <ul className="pl-4 text-light-hint text-sm leading-6 list-disc">
        {item.exclusiveBonusId !== undefined && (
          <RecordExclusives id={item.exclusiveBonusId} attkBonusCtrl={attkBonusCtrl} />
        )}

        <li className="mt-1">
          <Heading label="Value">{baseValue}</Heading> = <Parts specs={basePartSpecs} />
          {data.note}
        </li>
      </ul>
    </div>
  );
}
