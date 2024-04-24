import type {
  AttackElementPath,
  AttackPatternInfoKey,
  AttackPatternPath,
  AttributeStat,
  ModInputConfig,
  ModifierAffectType,
  ReactionBonusPath,
} from "@Src/types";

/**
 * For this buff to available, the input at the [source] must meet [value] by [type].
 * On CharacterBonus & WeaponBonus
 */
export type InputCheck = {
  value: number;
  /** Default to 0 */
  source?: number | "BOL" | "various_elmt";
  /** Default to 'equal' */
  type?: "equal" | "min" | "max";
};

// ========== BONUS TARGET ==========

type AttributeTarget = {
  module: "ATTR";
  path: AttributeStat | AttributeStat[];
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
type CalcItemTarget = {
  module: "ITEM";
  path: AttackPatternInfoKey;
  id: string | string[];
};
type InputElementTarget = {
  module: "INP_ELMT";
  /** Input's index to get element's index. */
  path: number;
};
type OwnElementTarget = {
  module: "OWN_ELMT";
};
type ElementNaTarget = {
  module: "ELM_NA";
};

type AppBonusTarget =
  | AttributeTarget
  | AttackPatternTarget
  | AttackElementTarget
  | ReactionTarget
  | CalcItemTarget
  | InputElementTarget
  | OwnElementTarget
  | ElementNaTarget;

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

// ========== BONUS ==========

export type AppBonus<BonusStack = unknown> = {
  checkInput?: number | InputCheck;
  stacks?: BonusStack | BonusStack[];
  targets: AppBonusTarget | AppBonusTarget[];
};

export type AppBuff<T = unknown> = {
  /** This is id */
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  effects?: T | T[];
};
