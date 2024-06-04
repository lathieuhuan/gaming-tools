import { ATTACK_PATTERNS } from "../constants";
import type { CalcItemExclusiveBonus } from "../controls";
import { LevelableTalentType } from "../types";

type CalcItemPart = {
  baseFactors: Array<{
    value: number;
    mult?: number;
  }>;
  flat?: number;
  normalMult: number;
  specialMult?: number;
  rxnMult?: number;
  defMult?: number;
  resMult?: number;
  cRate_?: number;
  cDmg_?: number;
  exclusives?: CalcItemExclusiveBonus[];
};

type SimulationCalcItemGroup = Record<string, CalcItemPart>;

type SimulationCalcItem = Record<LevelableTalentType | "RXN_CALC" | "WP_CALC", SimulationCalcItemGroup>;

export default function getCalcItemPart(): SimulationCalcItem {
  const result = {} as SimulationCalcItem;

  for (const ATT_PATT of ATTACK_PATTERNS) {
    //
  }

  return result;
}
