import type { Character, PartyData } from "@Src/types";
import type {
  ActualAttackElement,
  AppCharacter,
  AttackElement,
  AttackPatternInfoKey,
  CalcItemType,
  NormalAttack,
} from "../types";

export type CalcInfusion = {
  element: AttackElement;
  range: NormalAttack[];
  isCustom: boolean;
};

export type CalcUltilInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
};

export type CalculationAspect = "nonCrit" | "crit" | "average";

export type CalculationFinalResultItem = Record<CalculationAspect, number | number[]> & {
  attElmt?: ActualAttackElement;
};

export type CalculationFinalResultGroup = Record<string, CalculationFinalResultItem>;

export type CalculationFinalResult = {
  NAs: CalculationFinalResultGroup;
  ES: CalculationFinalResultGroup;
  EB: CalculationFinalResultGroup;
  RXN: CalculationFinalResultGroup;
  WP_CALC: CalculationFinalResultGroup;
};

//

export type CalcItemBonus = Partial<Record<AttackPatternInfoKey, { desc: string; value: number }>>;

export type ProcessedItemBonus = Partial<Record<AttackPatternInfoKey, number>>;

export type CalcItemRecord = {
  itemType: CalcItemType;
  multFactors: Array<{
    desc: string;
    value: number;
    talentMult?: number;
  }>;
  totalFlat?: number;
  normalMult: number;
  specialMult?: number;
  rxnMult?: number;
  defMult?: number;
  resMult?: number;
  cRate_?: number;
  cDmg_?: number;
  note?: string;
  exclusives?: CalcItemBonus[];
};
