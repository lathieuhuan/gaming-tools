import type { AppCharacter, AttackPattern } from "@/types";

export function getTalentDefaultValues(
  data: AppCharacter,
  attPatt_: AttackPattern,
  isElemental: boolean
) {
  const {
    scale = isElemental || data.weaponType === "catalyst" ? 2 : 7,
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
