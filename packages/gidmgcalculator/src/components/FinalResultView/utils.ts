import type { CalcAspect } from "@/calculation/types";
import type { CalcAttackItemOutputs } from "@/logic/calculation";
import type { CalcResultItem } from "@/logic/calculator";
import type {
  AppCharacter,
  AppWeapon,
  LunarReaction,
  StellarReaction,
  TransformativeReaction,
} from "@/types";

import {
  LUNAR_REACTIONS,
  NORMAL_ATTACKS,
  STELLAR_REACTIONS,
  TRANSFORMATIVE_REACTIONS,
} from "@/constants/global";

export type TableCalcItemKey = {
  main: "NAs" | "ES" | "EB";
  subs: string[];
};

type TableWeaponKey = {
  main: "WP";
  subs: string[];
};

type TableExtraItemKey = {
  main: "EXTRA";
  subs: string[];
};

type TableReactionKey = {
  main: "RXN";
  subs: (TransformativeReaction | LunarReaction | StellarReaction)[];
};

export type TableKey = TableCalcItemKey | TableWeaponKey | TableReactionKey | TableExtraItemKey;

export function getTableKeys(
  calcList: AppCharacter["calcList"],
  weaponCalcItems?: AppWeapon["calcItems"],
  extraKeys?: string[],
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
      main: "EXTRA",
      subs: extraKeys,
    });
  }

  result.push({
    main: "RXN" as const,
    subs: [...STELLAR_REACTIONS, ...LUNAR_REACTIONS, ...TRANSFORMATIVE_REACTIONS],
  });

  if (weaponCalcItems) {
    result.push({
      main: "WP",
      subs: weaponCalcItems.map((item) => item.name),
    });
  }

  return result;
}

export const DEFAULT_RESULT_ITEM: Record<CalcAspect, string | number> = {
  base: 0,
  crit: 0,
  average: 0,
};

export const displayResultItem = (item: CalcResultItem): Record<CalcAspect, string | number> => {
  switch (item.type) {
    case "attack":
    case "reaction": {
      const bases: number[] = [];
      const crits: number[] = [];
      const averages: number[] = [];

      for (const result of item.results) {
        bases.push(Math.round(result.base));
        crits.push(Math.round(result.crit));
        averages.push(Math.round(result.average));
      }

      return {
        base: bases[0] === 0 ? "-" : bases.join(" + "),
        crit: crits[0] === 0 ? "-" : crits.join(" + "),
        average: averages[0] === 0 ? "-" : averages.join(" + "),
      };
    }
    case "healing":
    case "shield":
    case "other": {
      const base = Math.round(item.result) || "-";

      return {
        base,
        crit: "-",
        average: base,
      };
    }
    default:
      item satisfies never;

      return DEFAULT_RESULT_ITEM;
  }
};

export function attackCalcItemSubtitleParts(item: CalcAttackItemOutputs) {
  return [
    `${item.attElmt}_attElmt`,
    item.attPatt && item.attPatt !== "none" && item.attPatt,
    item.specPatt && item.specPatt,
  ].filter((part) => typeof part === "string");
}
