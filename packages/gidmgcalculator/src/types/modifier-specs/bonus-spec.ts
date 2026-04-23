import type {
  AttackBonusKey,
  AttackBonusType,
  AttributeStat,
  BaseAttributeStat,
  LevelableTalentType,
} from "../common";
import type { EffectStackSpec, EnergyCostStackSpec, StacksBonusSpec } from "./effect-stack-spec";
import type { BonusAttributeScalingSpec, TalentLevelIncrementSpec } from "./common-specs";
import type { EffectConditionSpecs } from "./effect-condition-specs";
import type { EffectMaxSpec } from "./effect-max-spec";
import type { EffectValueSpec } from "./effect-value-spec";

export type BonusCoreSpec = EffectConditionSpecs & {
  id: string;
  monoId?: string;
  value: EffectValueSpec;
  /**
   * Incre based on character talent level.
   * Added before preExtra
   */
  lvIncre?: TalentLevelIncrementSpec;
  /**
   * On Weapons. Increment to value after each refinement.
   * Default 1/3 of [value]. Fixed buff type has increment = 0.
   * Added before preExtra
   */
  incre?: number;
  /** Added before basedOn > stacks */
  preExtra?: number | BonusCoreSpec;
  /** Added right before stacks */
  basedOn?: BonusAttributeScalingSpec;
  stacks?: EffectStackSpec;
  /** When max is number on Weapon Bonus, it will auto scale off refi */
  max?: EffectMaxSpec;
  /** Added after max */
  stacksBonus?: StacksBonusSpec;
  /** Added after max */
  extras?: number | BonusCoreSpec | BonusCoreSpec[];
  outsource?: {
    stacks?: EnergyCostStackSpec;
  };
};

export type AttributeTargetPath =
  | "INP_ELMT"
  | "OWN_ELMT"
  | "P/H/E/C"
  | AttributeStat
  | BaseAttributeStat;

type AttributeTargetSpec = {
  module: "ATTR";
  path: AttributeTargetPath | AttributeTargetPath[];
  /** Input's index to get element's index if path is 'INP_ELMT'. Default 0 */
  inpIndex?: number;
};

type AttackBonusTargetSpec = {
  module: AttackBonusType | AttackBonusType[];
  path: AttackBonusKey;
};

type TalentLevelTargetSpec = {
  module: "TLT";
  path: LevelableTalentType;
};

type BonusTargetsSpec =
  | AttributeTargetSpec
  | AttackBonusTargetSpec
  | AttackBonusTargetSpec[]
  | TalentLevelTargetSpec;

export type BonusSpec = BonusCoreSpec & {
  targets: BonusTargetsSpec;
};
