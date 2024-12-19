import type { PartiallyRequired } from "rond";
import type { ArtifactModCtrl, Character, PartyData } from "@Src/types";
import type {
  ActualAttackElement,
  ActualAttackPattern,
  AmplifyingReaction,
  AttackBonusKey,
  AttackBonusType,
  AttackPattern,
  AttributeStat,
  CalcItemType,
  CoreStat,
  LevelableTalentType,
  QuickenReaction,
} from "./common.types";
import type { AppCharacter, CharacterBuffNormalAttackConfig } from "./app-character.types";

export type AttackReaction = AmplifyingReaction | QuickenReaction | null;

export type CalculationInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
};

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<AttributeStat | "hp_base" | "atk_base" | "def_base", number>;

export type ArtifactAttribute = PartiallyRequired<Partial<Record<AttributeStat, number>>, CoreStat>;

export type BareBonus = {
  id: string;
  value: number;
  isStable: boolean;
};

export type AppliedAttributeBonus = BareBonus & {
  toStat: AttributeStat | "base_atk";
  description: string;
};

export type AppliedAttackBonus = Pick<BareBonus, "id" | "value"> & {
  toType: AttackBonusType;
  toKey: AttackBonusKey;
  description: string;
};

export type AppliedBonuses = {
  attrBonuses: AppliedAttributeBonus[];
  attkBonuses: AppliedAttackBonus[];
};

type AttackBonusRecord = Pick<AppliedAttackBonus, "value" | "toKey" | "description">;

export type AttackBonuses = Array<{
  type: AttackBonusType;
  records: AttackBonusRecord[];
}>;

//

export type NormalAttacksConfig = Partial<Record<AttackPattern, Omit<CharacterBuffNormalAttackConfig, "forPatt">>>;

export type CalculationAspect = "nonCrit" | "crit" | "average";

type CalculationFinalResultCommon = Record<CalculationAspect, number | number[]>;

type CalculationFinalResultAttackItem = CalculationFinalResultCommon & {
  type: Extract<CalcItemType, "attack">;
  attElmt: ActualAttackElement;
  attPatt: ActualAttackPattern;
  reaction: AttackReaction;
};

type CalculationFinalResultOtherItem = CalculationFinalResultCommon & {
  type: Exclude<CalcItemType, "attack">;
};

export type CalculationFinalResultItem = CalculationFinalResultAttackItem | CalculationFinalResultOtherItem;

export type CalculationFinalResultKey = LevelableTalentType | "RXN_CALC" | "WP_CALC";

export type CalculationFinalResultGroup = Record<string, CalculationFinalResultItem>;

export type CalculationFinalResult = Record<CalculationFinalResultKey, CalculationFinalResultGroup>;

// OPTIMIZER

export type OptimizerArtifactBuffConfigs = {
  [code: string]: Pick<ArtifactModCtrl, "index" | "activated" | "inputs">[];
};

export type OptimizerExtraConfigs = {
  useOwnedPiece: boolean;
  minEr?: number;
  // minEm?: number;
};
