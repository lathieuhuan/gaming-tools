import type {
  AttackElementPath,
  AttackPatternInfoKey,
  AttackPatternPath,
  AttributeStat,
  ElementType,
  ReactionBonusPath,
  ResistanceReductionKey,
  TalentType,
} from "./common.types";

export type CalcItemType = "attack" | "healing" | "shield" | "other";

//

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

export type AppBonusAttributeStack = {
  type: "ATTRIBUTE";
  field: "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";
  /** Substract attribute by baseline to get effective attribute to be stacks. */
  baseline?: number;
};

/** On CharacterBonus & WeaponBonus  */
export type AppBonusNationStack = {
  type: "NATION";
  /** Default to 'same' */
  nation?: "same" | "different";
};

export type AppBonusElementStack = {
  type: "ELEMENT";
  element: "same_included" | "same_excluded" | "different";
  max?: number;
};

// ========== BONUS TARGET ==========

type AttributeTarget = {
  module: "ATTR";
  path: "INP_ELMT" | "OWN_ELMT" | AttributeStat | AttributeStat[];
  /** Input's index to get element's index if path is 'INP_ELMT'. Default to 0 */
  inpIndex?: number;
};
type AttackPatternTarget = {
  module: "PATT";
  path: AttackPatternPath | AttackPatternPath[];
};
type AttackElementTarget = {
  module: "ELMT";
  path: AttackElementPath | AttackElementPath[];
};
type ReactionTarget = {
  module: "RXN";
  path: ReactionBonusPath | ReactionBonusPath[];
};
export type CalcItemTarget = {
  module: "ITEM";
  path: AttackPatternInfoKey;
  id: string | string[];
};
type ElementNaTarget = {
  module: "ELM_NA";
};

export type AppBonusTarget =
  | AttributeTarget
  | AttackPatternTarget
  | AttackElementTarget
  | ReactionTarget
  | CalcItemTarget
  | ElementNaTarget;

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

type AppBonusValueOption = {
  options: number[];
  /** If number, [source] is "INPUT", the number value is inpIndex. Default to 0 */
  optIndex?: number | InputOptionIndex | ElementOptionIndex | LevelOptionIndex;
};

// ========== BONUS & BUFF ==========

export type AppBonus<BonusStack, ValueOptionExtends = object> = {
  value: number | (AppBonusValueOption & ValueOptionExtends);
  checkInput?: number | InputCheck;
  /** Index of the pre-calculated stack from [cmnStacks] */
  stackIndex?: number;
  stacks?: BonusStack | BonusStack[];
};

export type AppBuff<T extends AppBonus<unknown>> = {
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
  targets: AppBonusTarget | AppBonusTarget[];
};

// ========== PENALTY & DEBUFF ==========

export type AppPenaltyTarget =
  | ResistanceReductionKey
  | {
      type: "inp_elmt";
      /** Input's index to get ElementType index. Default to 0 */
      inpIndex?: number;
    };

export type AppDebuff<T = unknown> = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputConfig[];
  effects?: T;
};

export type WithPenaltyTargets<T> = T & {
  targets: AppPenaltyTarget | AppPenaltyTarget[];
};
