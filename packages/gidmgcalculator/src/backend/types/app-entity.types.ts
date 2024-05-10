import type { ECalcStatModule } from "../constants/internal.constants";
import type {
  AttackBonusType,
  AttributeStat,
  BonusKey,
  ElementType,
  ReactionBonusPath,
  ResistanceReductionKey,
  TalentType,
  WeaponType,
} from "./common.types";

export type CalcItemType = "attack" | "healing" | "shield" | "other";

// ========== CONDITIONS ==========

/**
 * For the buff/bonus to be available, the input at the [source] must meet [value] by [type].
 * On CharacterBonus & WeaponBonus
 */
export type InputCheck = {
  value: number;
  /** Default to 0 */
  source?: number | "various_vision";
  /** Default to 'equal' */
  type?: "equal" | "min" | "max";
};

type EffectUsableCondition = {
  checkInput?: number | InputCheck;
};

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C4" | "C6";

type CharacterEffectAvailableCondition = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  alterIndex?: number;
};

/** Mostly on characters */
type ExtraCondition = {
  /** On Chongyun, 2 original artifacts */
  forWeapons?: WeaponType[];
  /** On Chevreuse */
  forElmts?: ElementType[];
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

export type ApplicableCondition = EffectUsableCondition & CharacterEffectAvailableCondition & ExtraCondition;

// ========== MODIFIERS ==========

export type ModifierAffectType = "SELF" | "TEAMMATE" | "SELF_TEAMMATE" | "PARTY" | "ONE_UNIT" | "ACTIVE_UNIT";

export type ModInputType = "LEVEL" | "TEXT" | "CHECK" | "STACKS" | "SELECT" | "ANEMOABLE" | "DENDROABLE";

export type ModInputConfig = {
  label?: string;
  type: ModInputType;
  for?: "FOR_SELF" | "FOR_TEAM";
  /** See ModifierControl model for default value */
  initialValue?: number;
  max?: number;
  options?: string[];
};

// ========== BONUS STACKS ==========

export type EntityEffectExtra = ApplicableCondition & {
  value: number;
};

/** Only on Tulaytullah's Remembrance */
type InputIndex = {
  value: number;
  ratio?: number;
};
type InputStack = {
  type: "INPUT";
  /** If number, default to 0 */
  index?: number | InputIndex[];
  /** When this bonus is from teammate, this is input's index to get stacks. On characters */
  alterIndex?: number;
  /** Input's index when activated (equal to 1), value is doubled. On some weapons */
  doubledAt?: number;
  /** Actual stack = capacity - input. On Wanderer */
  capacity?: {
    value: number;
    extra: EntityEffectExtra;
  };
};

type AttributeStack = {
  type: "ATTRIBUTE";
  field: "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";
  /**
   * When this bonus is from teammate, this is input's index to get value.
   * On characters. Default to 0
   */
  alterIndex?: number;
};

type ElementStack = {
  type: "ELEMENT";
  element: "same_included" | "same_excluded" | "different";
};

/** On characterss & weapons  */
type NationStack = {
  type: "NATION";
  nation: "same" | "different" | "liyue";
};

type EnergyCostStack = {
  type: "ENERGY";
  /** 'ACTIVE' on Raiden Shogun. 'PARTY' on Watatsumi series */
  scope: "ACTIVE" | "PARTY";
};
/** On Raiden Shogun */
type ResolveStack = {
  type: "RESOLVE";
};

export type EntityBonusStack = (
  | InputStack
  | AttributeStack
  | ElementStack
  | NationStack
  | EnergyCostStack
  | ResolveStack
) & {
  /** actual stacks = stacks - baseline */
  baseline?: number;
  /** On Furina */
  extra?: EntityEffectExtra;
  max?: EntityEffectMax;
};

// ========== BONUS MAX ==========

export type EntityEffectExtraMax = ApplicableCondition & {
  value: number;
};

type EntityEffectDynamicMax = {
  value: number;
  /** On Hu Tao */
  stacks?: EntityBonusStack;
  extras?: EntityEffectExtraMax | EntityEffectExtraMax[];
};

export type EntityEffectMax = number | EntityEffectDynamicMax;

// ========== BONUS TARGET ==========

type AttributeTarget = {
  module: ECalcStatModule.ATTR;
  path: "INP_ELMT" | "OWN_ELMT" | AttributeStat | AttributeStat[];
  /** Input's index to get element's index if path is 'INP_ELMT'. Default to 0 */
  inpIndex?: number;
};
type AttackBonusTarget = {
  module: "ALL_ELMT" | AttackBonusType;
  path: BonusKey;
};
type ReactionTarget = {
  module: ECalcStatModule.RXN;
  path: ReactionBonusPath | ReactionBonusPath[];
};
export type CalcItemTarget = {
  module: "ITEM";
  path: BonusKey;
  id: string | string[];
};

export type EntityBonusTarget = AttributeTarget | AttackBonusTarget | ReactionTarget | CalcItemTarget;

// ========== BONUS VALUE ==========

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
  talent: TalentType;
};

export type EntityBonusValueOption = {
  options: number[];
  /** If number, [source] is "INPUT", the number value is inpIndex. Default to 0 */
  optIndex?: number | InputOptionIndex | ElementOptionIndex | LevelOptionIndex;
};

// ========== BONUS & BUFF ==========

export type EntityBonus<ValueOptionExtends = object> = ApplicableCondition & {
  value: number | (EntityBonusValueOption & ValueOptionExtends);
  /** Index of the pre-calculated stack from [cmnStacks] */
  stackIndex?: number;
  stacks?: EntityBonusStack | EntityBonusStack[];
};

export type EntityBuff<T extends EntityBonus<unknown>> = {
  /** This is id */
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  cmnStacks?: T["stacks"];
  effects?: T | T[];
  /**
   * id to track stackable.
   * Effects under the same buff id and have the same bonus path cannot be stacked.
   * CharacterBuff should not have this
   */
  trackId?: string;
};

export type WithBonusTargets<T> = T & {
  targets: EntityBonusTarget | EntityBonusTarget[];
};

// ========== PENALTY & DEBUFF ==========

export type EntityPenaltyTarget =
  | ResistanceReductionKey
  | {
      type: "inp_elmt";
      /** Input's index to get ElementType index. Default to 0 */
      inpIndex?: number;
    };

export type EntityDebuff<T = unknown> = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputConfig[];
  effects?: T;
};

export type WithPenaltyTargets<T> = T & {
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
};
