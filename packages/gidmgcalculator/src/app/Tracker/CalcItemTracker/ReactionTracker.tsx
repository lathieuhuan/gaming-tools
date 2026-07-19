import { round } from "ron-utils";

import type { CalcResultReactionItem } from "@/calculation/types";

import { useTranslation } from "@/hooks";
import { itemValue } from "./utils";

import { Parts } from "./Parts";
import { Header, RecordAverage, RecordCrit } from "./SubRecord";

type ReactionTrackerProps = {
  title: string;
  item: CalcResultReactionItem;
};

export function ReactionTracker({ title, item }: ReactionTrackerProps) {
  const { t } = useTranslation();

  if (!item?.values[0]?.base) {
    return null;
  }

  const data = item.recorder.data;
  const factor = data.factors[0];
  const baseValue = itemValue(item.values, "base");
  const cDmg = data.cDmg_ ? round(data.cDmg_, 3) : 0;

  return (
    <div>
      <p className="font-medium">{t(title)}</p>
      {/* <div className="text-sm text-secondary-1">{t(`${item.attElmt}_attElmt`)}</div> */}

      <ul className="pl-4 text-light-hint text-sm leading-6 list-disc">
        <li className="mt-1">
          <Header label="Non-crit">{baseValue}</Header> ={" "}
          <Parts
            configs={[
              {
                containers: ["(", ")"],
                parts: [
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
            ]}
          />
          {data.note}
        </li>

        {cDmg !== 0 && (
          <RecordCrit result={itemValue(item.values, "crit")} base={baseValue} cDmg={cDmg} />
        )}

        {cDmg !== 0 && data.cRate_ !== undefined && (
          <RecordAverage
            result={itemValue(item.values, "average")}
            base={baseValue}
            cDmg={cDmg}
            cRate={data.cRate_}
          />
        )}
      </ul>
    </div>
  );
}
