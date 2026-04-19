import type {
  AttackBonusKey,
  AttackBonusType,
  AttributeStat,
  BaseAttributeStat,
  LevelableTalentType,
} from "../common";
import type {
  CharacterEffectLevelIncrement,
  CharacterEffectLevelScale,
  BonusAttributeBaseSpec,
} from "./common-specs";
import type { EnergyCostStack, EntityBonusStack } from "./effect-bonus-stack";
import type { EffectCondition } from "./effect-condition";
import type { EffectMax } from "./effect-max";
import type { EffectValue } from "./effect-value";

export type EntityBonusEffect = EffectCondition & {
  id: string;
  monoId?: string;
  value: EffectValue;
  /**
   * On Characters. Multiplier based on talent level.
   * Added before preExtra
   */
  lvScale?: CharacterEffectLevelScale;
  /**
   * Incre based on character talent level.
   * Added after lvScale
   */
  lvIncre?: CharacterEffectLevelIncrement;
  /**
   * On Weapons. Increment to value after each refinement.
   * Default 1/3 of [value]. Fixed buff type has increment = 0.
   * Added before preExtra
   */
  incre?: number;
  /** Added before basedOn > stacks */
  preExtra?: number | EntityBonusEffect;
  /** Added right before stacks */
  basedOn?: BonusAttributeBaseSpec;
  stacks?: EntityBonusStack;
  /** When max is number on Weapon Bonus, it will auto scale off refi */
  max?: EffectMax;
  /** Added after max */
  extras?: number | EntityBonusEffect | EntityBonusEffect[];
  outsource?: {
    stacks?: EnergyCostStack;
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

type EntityBonusTargetsSpec =
  | AttributeTargetSpec
  | AttackBonusTargetSpec
  | AttackBonusTargetSpec[]
  | TalentLevelTargetSpec;

export type EntityBonus = EntityBonusEffect & {
  targets: EntityBonusTargetsSpec;
};
