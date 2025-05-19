import type { CharacterEffectLevelScale, EntityBonusBasedOn } from "./app-entity-common.types";
import type { EntityBonusStack } from "./effect-bonus-stack.types";
import type { EffectApplicableCondition } from "./effect-condition.types";
import type { EffectExtra } from "./effect-extra.types";
import type { EffectMax } from "./effect-max.types";
import type { EntityBonusTargets } from "./effect-target.types";
import type { EffectValueByOption } from "./effect-value.types";

type CharacterEntityBonusValueByOptionExtend = {
  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Nahida */
  extra?: EffectExtra;
  /** Max optIndex. Dynamic on Navia */
  max?: EffectMax;
};

export type EntityBonusCore<TBonusExtend extends object = object> = TBonusExtend &
  EffectApplicableCondition & {
    id: string;
    value: number | (EffectValueByOption & CharacterEntityBonusValueByOptionExtend);
    /**
     * On Characters. Multiplier based on talent level
     * Added before preExtra
     */
    lvScale?: CharacterEffectLevelScale;
    /**
     * On Weapons. Increment to value after each refinement.
     * Default to 1/3 of [value]. Fixed buff type has increment = 0.
     * Added before preExtra
     */
    incre?: number;
    /** Added before basedOn */
    preExtra?: number | EntityBonusCore<TBonusExtend>;
    /** Added right before stacks */
    basedOn?: EntityBonusBasedOn;
    stacks?: EntityBonusStack;
    /** Added after stacks */
    sufExtra?: number | EntityBonusCore<TBonusExtend>;
    /** When max is number on Weapon Bonus, it will auto scale off refi */
    max?: EffectMax;
  };

export type EntityBonus<TEntityBonusCore extends EntityBonusCore = EntityBonusCore> = TEntityBonusCore & {
  targets: EntityBonusTargets;
};
