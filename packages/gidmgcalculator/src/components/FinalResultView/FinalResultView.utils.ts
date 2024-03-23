import type { AppCharacter } from "@Src/types";
import { NORMAL_ATTACKS, TRANSFORMATIVE_REACTIONS } from "@Src/constants";

type AttackPatternKey = {
  main: "NAs" | "ES" | "EB";
  subs: string[];
};

type ReactionKey = {
  main: "RXN";
  subs: Array<(typeof TRANSFORMATIVE_REACTIONS)[number]>;
};

export type TableKey = AttackPatternKey | ReactionKey;

export function getTableKeys(appChar: AppCharacter): TableKey[] {
  const NAs: AttackPatternKey = {
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

  return result;
}

export function displayValue(value?: number | number[]) {
  if (value) {
    return Array.isArray(value) ? value.map((v) => Math.round(v)).join(" + ") : Math.round(value);
  }
  return "-";
}
