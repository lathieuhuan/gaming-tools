import { AttackPatternInfoKey, CalcItemBonus } from "@Src/types";

export const getExclusiveBonus = (bonuses: CalcItemBonus[], key: AttackPatternInfoKey) => {
  return bonuses.reduce((total, bonus) => total + (bonus[key]?.value || 0), 0);
};
