import type { ElementType, LevelableTalentType } from "../common.types";
import type { EntityBonusBasedOn, CharacterEffectLevelScale } from "./app-entity-common.types";
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
  /**
   * 'various_types' count elements of entire party.
   * 'different' count teammates of different elements from the character
   * ElementType count teammates of ElementType
   * ElementType[] count teammates of one of ElementType[]
   */
  element: "various_types" | "different" | ElementType | ElementType[];
  /** When 'element' is ElementType[]: count distinct elements that are included in ElementType[] */
  distinct?: boolean;
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
    id: string;
    value: number | (EntityBonusValueByOption & CharacterEntityBonusValueByOptionExtend);
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
    max?: EffectMax;
  };

export type EntityBonus<TEntityBonusCore extends EntityBonusCore = EntityBonusCore> = TEntityBonusCore & {
  targets: EntityBonusTargets;
};
