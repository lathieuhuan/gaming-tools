import {
  AppCharacter,
  AppWeapon,
  LUNAR_REACTIONS,
  LunarReaction,
  NORMAL_ATTACKS,
  TRANSFORMATIVE_REACTIONS,
  TransformativeReaction,
} from "@Calculation";

type TableCalcItemKey = {
  main: "NAs" | "ES" | "EB" | "WP_CALC";
  subs: string[];
};

type TableReactionKey = {
  main: "RXN_CALC";
  subs: (TransformativeReaction | LunarReaction)[];
};

export type TableKey = TableCalcItemKey | TableReactionKey;

export function getTableKeys(appCharacter?: AppCharacter, appWeapon?: AppWeapon): TableKey[] {
  if (!appCharacter) return [];

  const NAs: TableCalcItemKey = {
    main: "NAs",
    subs: [],
  };
  for (const na of NORMAL_ATTACKS) {
    NAs.subs = NAs.subs.concat(appCharacter.calcList[na].map(({ name }) => name));
  }

  const result: TableKey[] = [NAs];

  for (const attPatt of ["ES", "EB"] as const) {
    result.push({
      main: attPatt,
      subs: appCharacter.calcList[attPatt].map(({ name }) => name),
    });
  }

  result.push({
    main: "RXN_CALC" as const,
    subs: [...LUNAR_REACTIONS, ...TRANSFORMATIVE_REACTIONS],
  });

  if (appWeapon?.calcItems) {
    result.push({
      main: "WP_CALC",
      subs: appWeapon.calcItems.map((item) => item.name),
    });
  }

  return result;
}

export function displayValue(value?: number | number[]) {
  if (value) {
    return Array.isArray(value) ? value.map(Math.round).join(" + ") : Math.round(value);
  }
  return "-";
}
