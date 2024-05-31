import type { PartiallyRequired } from "rond";
import type { Character, PartyData } from "@Src/types";
import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttributeStat,
  CoreStat,
  LevelableTalentType,
} from "./common.types";
import type { CalcItemType } from "./app-entity.types";
import type { AppCharacter } from "./app-character.types";

/** Actually does not contain "hp_" | "atk_" | "def_" */
type TotalAttributeStat = AttributeStat | "hp_base" | "atk_base" | "def_base";

export type ArtifactAttribute = PartiallyRequired<Partial<Record<TotalAttributeStat, number>>, CoreStat>;

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<TotalAttributeStat, number>;

//

export type CalculationHelperInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
};

export type CalculationAspect = "nonCrit" | "crit" | "average";

type CalculationFinalResultAttackItem = {
  type: Extract<CalcItemType, "attack">;
  attElmt: ActualAttackElement;
  attPatt: ActualAttackPattern;
};

type CalculationFinalResultOtherItem = {
  type: Exclude<CalcItemType, "attack">;
};

export type CalculationFinalResultItem = Record<CalculationAspect, number | number[]> &
  (CalculationFinalResultAttackItem | CalculationFinalResultOtherItem);

export type CalculationFinalResultGroup = Record<string, CalculationFinalResultItem>;

export type CalculationFinalResultKey = LevelableTalentType | "RXN_CALC" | "WP_CALC";

export type CalculationFinalResult = Record<CalculationFinalResultKey, CalculationFinalResultGroup>;
