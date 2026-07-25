import { round } from "ron-utils";

import type { CalcResultReactionItem } from "@/calculation/types";

import { useTranslation } from "@/hooks";
import { resultValue } from "./utils";

import { Parts, PartSpecType } from "./components/ResultParts";
import { Heading, RecordAverage, RecordCrit } from "./components/ResultRecord";

type ReactionItemTrackerProps = {
  title: string;
  item: CalcResultReactionItem;
};

export function ReactionItemTracker({ title, item }: ReactionItemTrackerProps) {
  const { t } = useTranslation();

  if (!item?.values[0]?.base) {
    return null;
  }

  const data = item.recorder.data;
  const baseValue = resultValue(item.values, "base");
  const cDmg = data.cDmg_ ? round(data.cDmg_, 3) : 0;

  const factor = data.factors[0];
  const basePartSpecs: PartSpecType[] = [
    {
      containers: ["(", ")"],
      specs: [
        {
          sign: null,
          label: t(factor.label),
          value: factor.value,
          nullValue: -1,
          process: Math.round,
        },
        {
          sign: "*",
          label: "Base DMG Mult.",
          value: data.rxnBaseMult,
          nullValue: 1,
          process: (value) => `${round(value * 100, 2)}%`,
        },
        {
          sign: "*",
          label: "Bonus Mult.",
          value: data.bonusMult,
          process: (value) => `${round(value * 100, 2)}%`,
        },
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
  ];

  return (
    <div>
      <p className="font-medium">{t(title)}</p>
      {/* <div className="text-sm text-secondary-1">{t(`${item.attElmt}_attElmt`)}</div> */}

      <ul className="mt-1 pl-4 text-light-hint text-sm leading-6 list-disc">
        <li>
          <Heading label="Non-crit">{baseValue}</Heading> = <Parts specs={basePartSpecs} />
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
