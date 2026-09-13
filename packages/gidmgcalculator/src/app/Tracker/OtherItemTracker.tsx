import type { ReactNode } from "react";
import { round } from "ron-utils";

import type { CalcOtherItemOutputs } from "@/logic/calculation";

import { useTranslation } from "@/hooks";

import { Parts, PartSpecType } from "./components/ResultParts";
import { Heading } from "./components/ResultRecord";

type OtherItemTrackerProps = {
  title: string;
  item: CalcOtherItemOutputs;
  exclusiveRecord?: ReactNode;
};

export function OtherItemTracker({ title, item, exclusiveRecord }: OtherItemTrackerProps) {
  const { t } = useTranslation();

  const basePartSpecs: PartSpecType[] = [
    {
      containers: ["(", ")"],
      specs: [
        {
          sign: null,
          label: "Talent Mult.",
          value: item.multiplier,
          process: (value) => `${round(value, 2)}%`,
        },
        {
          sign: "*",
          label: t(item.basedOnAttr),
          value: item.basedOnValue,
          nullValue: -1,
          process: Math.round,
        },
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
      label: "Incoming Heal Mult.",
      value: item.type === "healing" ? item.inHealMult : undefined,
    },
  ];

  return (
    <div>
      <p className="font-medium">{title}</p>

      <ul className="pl-4 text-light-hint text-sm leading-6 list-disc">
        {exclusiveRecord}

        <li className="mt-1">
          <Heading label="Value">{Math.round(item.result)}</Heading> ={" "}
          <Parts specs={basePartSpecs} />
        </li>
      </ul>
    </div>
  );
}
