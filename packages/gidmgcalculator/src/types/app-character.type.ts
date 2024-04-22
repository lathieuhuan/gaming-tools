import type {
  AttributeStat,
  ElementType,
  ModInputConfig,
  ModifierAffectType,
  Nation,
  Talent,
  WeaponType,
} from "./global.types";
import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackElementPath,
  AttackPatternInfoKey,
  AttackPatternPath,
  CalcItemType,
  ReactionBonusPath,
  ResistanceReductionKey,
} from "./calculation-core.types";
import type { InputCheck } from "./app-common.types";

export type AppCharacter = {
  code: number;
  name: string;
  beta?: boolean;
  GOOD?: string;
  icon: string;
  sideIcon: string;
  rarity: number;
  nation: Nation;
  vision: ElementType;
  weaponType: WeaponType;
  EBcost: number;
  talentLvBonus?: Partial<Record<Talent, number>>;
  stats: number[][];
  statBonus: {
    type: AttributeStat;
    value: number;
  };
  multFactorConf?: {
    NA?: MultFactorConfig;
    CA?: MultFactorConfig;
    PA?: MultFactorConfig;
    ES?: MultFactorConfig;
    EB?: MultFactorConfig;
  };
  calcList: {
    NA: CalcItem[];
    CA: CalcItem[];
    PA: CalcItem[];
    ES: CalcItem[];
    EB: CalcItem[];
  };
  activeTalents: {
    NAs: Ability;
    ES: Ability;
    EB: Ability;
    altSprint?: Ability;
  };
  passiveTalents: Ability[];
  constellation: Ability[];
  innateBuffs?: CharacterInnateBuff[];
  buffs?: CharacterBuff[];
  debuffs?: CharacterDebuff[];
};

export type TalentAttributeType = "base_atk" | "atk" | "def" | "hp" | "em";

type MultFactorConfig = {
  scale?: number;
  basedOn?: TalentAttributeType;
};

type Ability = {
  name: string;
  image?: string;
  description?: string;
};

type CalcItemMultFactor = {
  root: number;
  /** When 0 stat not scale off talent level */
  scale?: number;
  /** Calc default to 'atk'. Only on ES / EB */
  basedOn?: TalentAttributeType;
};

export type CalcItem = {
  id?: string;
  name: string;
  type?: CalcItemType;
  notOfficial?: boolean;
  attPatt?: ActualAttackPattern;
  attElmt?: ActualAttackElement;
  subAttPatt?: "FCA";
  /**
   * Damage factors multiplying an attribute, scaling off talent level
   */
  multFactors: number | number[] | CalcItemMultFactor | CalcItemMultFactor[];
  joinMultFactors?: boolean;
  /**
   * Damage factor multiplying root, caling off talent level. Only on ES / EB
   */
  flatFactor?:
    | number
    | {
        root: number;
        /**
         * Calc default to getTalentDefaultInfo's return.flatFactorScale.
         * When 0 not scale off talent level.
         */
        scale?: number;
      };
};

// ============ MODIFIERS COMMON ============

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C4" | "C6";

export type CharacterModifier = {
  src: string;
  grantedAt?: CharacterMilestone;
  description: string;
};

export type CharacterEffectAvailableCondition = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  alterIndex?: number;
};

export type CharacterEffectUsableCondition = CharacterEffectAvailableCondition & {
  checkInput?: number | InputCheck;
};

export type CharacterEffectExtendedUsableCondition = CharacterEffectUsableCondition & {
  /** On Chongyun */
  forWeapons?: WeaponType[];
  /** On Chevreuse */
  forElmts?: ElementType[];
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

export type CharacterEffectLevelScale = {
  talent: Talent;
  /** If [value] = 0: buff value * level. Otherwise buff value * TALENT_LV_MULTIPLIERS[value][level]. */
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  alterIndex?: number;
  /** On Raiden */
  max?: number;
};

// ============ BUFFS ============

export type CharacterEffectExtraMax = CharacterEffectUsableCondition & {
  value: number;
};

export type CharacterEffectDynamicMax = {
  value: number;
  extras: CharacterEffectExtraMax[];
};

type InputStack = {
  type: "INPUT";
  /** Default to 0 */
  index?: number;
  /** When this bonus is from teammate, this is input's index to get stacks. */
  alterIndex?: number;
  /** On Wanderer */
  capacity?: {
    value: number;
    extra: CharacterEffectUsableCondition & {
      value: number;
    };
  };
};

type AttributeStack = {
  type: "ATTRIBUTE";
  field: "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";
  /** When this bonus is from teammate, this is input's index to get value. Default to 0 */
  alterIndex?: number;
};

type NationStack = {
  /** On Charlotte */
  type: "NATION";
  nation: "same" | "different";
};

type EnergyStack = {
  /** On Raiden Shogun */
  type: "ENERGY";
};

type ResolveStack = {
  /** On Raiden Shogun */
  type: "RESOLVE";
};

type BondOfLifeStack = {
  type: "BOL";
};

export type CharacterBonusStack = (
  | InputStack
  | AttributeStack
  | NationStack
  | EnergyStack
  | ResolveStack
  | BondOfLifeStack
) & {
  /** Final stack = stack - required base */
  baseline?: number;
  /** On Furina */
  extra?: CharacterEffectAvailableCondition & {
    value: number;
  };
  /** Dynamic on Mika */
  max?: number | CharacterEffectDynamicMax;
};

export type CharacterEffectValueOption = {
  /** On Navia */
  preOptions?: number[];
  options: number[];
  indexSrc:
    | {
        type: "ELEMENT";
        elementType: "various" | ElementType | ElementType[];
      }
    | {
        /** On Neuvillette */
        type: "INPUT";
        index?: number;
      }
    | {
        /** On Razor */
        type: "LEVEL";
        talent: Talent;
      };
  /** Add to indexSrc. On Nahida */
  extra?: CharacterEffectAvailableCondition & {
    value: number;
  };
  /** Max index. Dynamic on Navia */
  max?: number | CharacterEffectDynamicMax;
};

export type CharacterBonusConfig = CharacterEffectExtendedUsableCondition & {
  value: number | CharacterEffectValueOption;
  /** Multiplier based on talent level */
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterBonusConfig;
  /** Index of pre-calculated stack */
  stackIndex?: number;
  stacks?: CharacterBonusStack | CharacterBonusStack[];
  max?:
    | number
    | {
        value: number;
        /** On Hu Tao */
        stacks?: CharacterBonusStack;
        /** On Xianyun */
        extras?: CharacterEffectExtraMax | CharacterEffectExtraMax[];
      };
};

export type CharacterBonus = CharacterBonusConfig & {
  targets: {
    /** totalAttr */
    ATTR?: AttributeStat | AttributeStat[];
    /** attPattBonus */
    PATT?: AttackPatternPath | AttackPatternPath[];
    /** attElmtBonus */
    ELMT?: AttackElementPath | AttackElementPath[];
    /** rxnBonus */
    RXN?: ReactionBonusPath | ReactionBonusPath[];
    /** calcItem */
    ITEM?: {
      id: string | string[];
      path: AttackPatternInfoKey;
    };
    /** Input's index to get element's index. */
    INP_ELMT?: number; // On Dendro Traveler, Kazuha, Sucrose
    /** On Candace */
    ELM_NA?: 1;
    /** Bond of Life */
    C_STATUS?: "BOL";
  };
};

export type CharacterInnateBuff = CharacterModifier & {
  cmnStacks?: CharacterBonus["stacks"];
  effects?: CharacterBonus | CharacterBonus[];
  infuseConfig?: {
    checkInput?: number | InputCheck;
    overwritable: boolean;
    range?: ("NA" | "CA" | "PA")[];
    disabledNAs?: boolean;
  };
};

type CharacterBuff = CharacterInnateBuff & {
  /** This is id */
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
};

// ============ DEBUFFS ============

type PenaltyTarget =
  | ResistanceReductionKey
  | {
      type: "inp_elmt";
      /** Input's index to get ElementType index. Default to 0 */
      index?: number;
    };

export type CharacterPenaltyConfig = CharacterEffectExtendedUsableCondition & {
  value: number;
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterPenaltyConfig;
  index?: number;
  max?: number;
};

export type CharacterPenalty = CharacterPenaltyConfig & {
  targets: PenaltyTarget | PenaltyTarget[];
};

type CharacterDebuff = CharacterModifier & {
  /** This is id */
  index: number;
  affect?: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  effects?: CharacterPenalty;
};
