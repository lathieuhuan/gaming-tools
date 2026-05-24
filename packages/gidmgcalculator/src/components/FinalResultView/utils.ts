import type { CalcAspect, CalcResultItemValue } from "@/calculation/types";
import type { AppCharacter, AppWeapon, LunarReaction, TransformativeReaction } from "@/types";

import { LUNAR_REACTIONS, NORMAL_ATTACKS, TRANSFORMATIVE_REACTIONS } from "@/constants/global";

export type TableCalcItemKey = {
  main: "NAs" | "ES" | "EB";
  subs: string[];
};

type TableWeaponKey = {
  main: "WP";
  subs: string[];
};

type TableExtraItemKey = {
  main: "XTRA";
  subs: string[];
};

type TableReactionKey = {
  main: "RXN";
  subs: (TransformativeReaction | LunarReaction)[];
};

export type TableKey = TableCalcItemKey | TableWeaponKey | TableReactionKey | TableExtraItemKey;

export function getTableKeys(
  calcList: AppCharacter["calcList"],
  weaponCalcItems?: AppWeapon["calcItems"],
  extraKeys?: string[]
): TableKey[] {
  const result: TableKey[] = [
    {
      main: "NAs",
      subs: NORMAL_ATTACKS.map((NA) => calcList[NA].map(({ name }) => name)).flat(),
    },
  ];

  for (const attPatt of ["ES", "EB"] as const) {
    result.push({
      main: attPatt,
      subs: calcList[attPatt].map(({ name }) => name),
    });
  }

  if (extraKeys) {
    result.push({
      main: "XTRA",
      subs: extraKeys,
    });
  }

  result.push({
    main: "RXN" as const,
    subs: [...LUNAR_REACTIONS, ...TRANSFORMATIVE_REACTIONS],
  });

  if (weaponCalcItems) {
    result.push({
      main: "WP",
      subs: weaponCalcItems.map((item) => item.name),
    });
  }

  return result;
}

export const displayValues = (values: CalcResultItemValue[], key: CalcAspect) => {
  const firstValue = values?.at(0)?.[key];

  if (firstValue) {
    let result = `${Math.round(firstValue)}`;

    for (let i = 1; i < values.length; i++) {
      result += ` + ${Math.round(values[i][key])}`;
    }

    return result;
  }

  return undefined;
};
