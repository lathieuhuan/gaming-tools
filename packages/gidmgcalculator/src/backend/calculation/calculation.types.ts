import type { PartiallyRequired } from "rond";
import type { Character, PartyData } from "@Src/types";
import type {
  ActualAttackElement,
  AppCharacter,
  AttackElement,
  AttributeStat,
  CoreStat,
  LevelableTalentType,
  NormalAttack,
} from "../types";

/** Actually does not contain "hp_" | "atk_" | "def_" */
type TotalAttributeStat = AttributeStat | "hp_base" | "atk_base" | "def_base";

export type ArtifactAttribute = PartiallyRequired<Partial<Record<TotalAttributeStat, number>>, CoreStat>;

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<TotalAttributeStat, number>;

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

export type CalculationFinalResultKey = LevelableTalentType | "RXN_CALC" | "WP_CALC";

export type CalculationFinalResult = Record<CalculationFinalResultKey, CalculationFinalResultGroup>;
