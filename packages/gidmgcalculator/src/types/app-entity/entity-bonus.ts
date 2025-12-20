import type { AttackBonusKey, AttackBonusType, AttributeStat, BaseAttributeStat } from "../common";
import type { CharacterEffectLevelScale, EntityBonusBasedOn } from "./app-entity-common";
import type { EnergyCostStack, EntityBonusStack } from "./effect-bonus-stack";
import type { EffectCondition } from "./effect-condition";
import type { EffectMax } from "./effect-max";
import type { EffectValue } from "./effect-value";

export type EntityBonusEffect = EffectCondition & {
  id: string;
  monoId?: string;
  value: EffectValue;
  /**
   * On Characters. Multiplier based on talent level
   * Added before preExtra
   */
  lvScale?: CharacterEffectLevelScale;
  /**
   * On Weapons. Increment to value after each refinement.
   * Default 1/3 of [value]. Fixed buff type has increment = 0.
   * Added before preExtra
   */
  incre?: number;
  /** Added before basedOn */
  preExtra?: number | EntityBonusEffect;
  /** Added right before stacks */
  basedOn?: EntityBonusBasedOn;
  stacks?: EntityBonusStack;
  /** Added after stacks */
  sufExtra?: number | EntityBonusEffect;
  /** When max is number on Weapon Bonus, it will auto scale off refi */
  max?: EffectMax;
  outsource?: {
    stacks?: EnergyCostStack;
  };
};

type AttributeTargetPath = "INP_ELMT" | "OWN_ELMT" | AttributeStat | BaseAttributeStat;

type AttributeTarget = {
  module: "ATTR";
  path: AttributeTargetPath | AttributeTargetPath[];
  /** Input's index to get element's index if path is 'INP_ELMT'. Default 0 */
  inpIndex?: number;
};

type AttackBonusTarget = {
  module: AttackBonusType | AttackBonusType[];
  path: AttackBonusKey;
};

type EntityBonusTargets = AttributeTarget | AttackBonusTarget | AttackBonusTarget[];

export type EntityBonus<TEntityEffect extends EntityBonusEffect = EntityBonusEffect> =
  TEntityEffect & {
    targets: EntityBonusTargets;
  };
