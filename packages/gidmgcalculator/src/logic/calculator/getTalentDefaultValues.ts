import type { AppCharacter, AttackPattern, CalcItemDefaultValues } from "@/types";

export function getTalentDefaultValues(
  data: AppCharacter,
  attPatt_: AttackPattern,
): CalcItemDefaultValues {
  const {
    scale = attPatt_ === "ES" || attPatt_ === "EB" || data.weaponType === "catalyst" ? 2 : 7,
    basedOn = "atk",
    attPatt = attPatt_,
  } = data.calcListConfig?.[attPatt_] || {};

  return {
    scale,
    basedOn,
    attPatt,
    flatFactorScale: 3,
  };
}
