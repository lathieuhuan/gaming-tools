import type { AppCharacter, AppWeapon, TransformativeReaction } from "@Src/types";
import { NORMAL_ATTACKS, TRANSFORMATIVE_REACTIONS } from "@Src/constants";

type CalcItemKey = {
  main: "NAs" | "ES" | "EB" | "WP_CALC";
  subs: string[];
};

type ReactionKey = {
  main: "RXN";
  subs: TransformativeReaction[];
};

export type TableKey = CalcItemKey | ReactionKey;

export function getTableKeys(appChar: AppCharacter, appWeapon?: AppWeapon): TableKey[] {
  const NAs: CalcItemKey = {
    main: "NAs",
    subs: [],
  };
  for (const na of NORMAL_ATTACKS) {
    NAs.subs = NAs.subs.concat(appChar.calcList[na].map(({ name }) => name));
  }

  const result: TableKey[] = [NAs];

  for (const attPatt of ["ES", "EB"] as const) {
    result.push({
      main: attPatt,
      subs: appChar.calcList[attPatt].map(({ name }) => name),
    });
  }

  result.push({
    main: "RXN" as const,
    subs: [...TRANSFORMATIVE_REACTIONS],
  });

  // if (appWeapon?.calcItems) {
  //   result.push({
  //     main: "WP_CALC",
  //     subs: appWeapon.calcItems.map((item) => item.name),
  //   });
  // }

  return result;
}

export function displayValue(value?: number | number[]) {
  if (value) {
    return Array.isArray(value) ? value.map((v) => Math.round(v)).join(" + ") : Math.round(value);
  }
  return "-";
}
