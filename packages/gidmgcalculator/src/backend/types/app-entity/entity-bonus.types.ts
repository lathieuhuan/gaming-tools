import type { ElementType, LevelableTalentType } from "../common.types";
import type { EntityBonusBasedOn } from "./app-entity-common.types";
import type { EntityBonusStack } from "./effect-bonus-stack.types";
import type { EffectApplicableCondition } from "./effect-condition.types";
import type { EffectExtra } from "./effect-extra.types";
import type { EffectMax } from "./effect-max.types";
import type { EntityBonusTargets } from "./effect-target.types";

type InputOptionIndex = {
  source: "INPUT";
  inpIndex: number;
};
type ElementOptionIndex = {
  source: "ELEMENT";
  element: "various" | ElementType | ElementType[];
};
/** On Razor */
type LevelOptionIndex = {
  source: "LEVEL";
  talent: LevelableTalentType;
};

export type EntityBonusValueByOption = {
  options: number[];
  /** If number, [source] is "INPUT", [inpIndex] is the number. Default to 0 */
  optIndex?: number | InputOptionIndex | ElementOptionIndex | LevelOptionIndex;
};

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
    // id: string;
    value: number | (EntityBonusValueByOption & CharacterEntityBonusValueByOptionExtend);
    /** Added right before stacks */
    basedOn?: EntityBonusBasedOn;
    stacks?: EntityBonusStack | EntityBonusStack[];
    /** Added before stacks */
    preExtra?: number | EntityBonusCore<TBonusExtend>;
    /** Added after stacks */
    sufExtra?: number | EntityBonusCore<TBonusExtend>;
  };

export type EntityBonus<TEntityBonusCore extends EntityBonusCore = EntityBonusCore> = TEntityBonusCore & {
  targets: EntityBonusTargets;
};
