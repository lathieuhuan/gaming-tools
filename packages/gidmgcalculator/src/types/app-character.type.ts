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
    NA?: CalcItemMultFactorConfig;
    CA?: CalcItemMultFactorConfig;
    PA?: CalcItemMultFactorConfig;
    ES?: CalcItemMultFactorConfig;
    EB?: CalcItemMultFactorConfig;
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
  innateBuffs?: InnateBuff_Character[];
  buffs?: Buff_Character[];
  debuffs?: Debuff_Character[];
};

export type TalentAttributeType = "base_atk" | "atk" | "def" | "hp" | "em";

type CalcItemMultFactorConfig = {
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

export type Modifier_Character = {
  src: string;
  grantedAt?: CharacterMilestone;
  description: string;
};

type InputCheck = {
  value: number;
  /** Default to 0 */
  index?: number;
  /** Default to 'equal' */
  type?: "equal" | "min" | "max" | "included";
};

export type AvailableCondition_Character = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  alterIndex?: number;
};

export type UsableCondition_Character = AvailableCondition_Character & {
  checkInput?: number | InputCheck;
};

export type ExtendedUsableCondition_Character = UsableCondition_Character & {
  /** On Chongyun */
  forWeapons?: WeaponType[];
  /** On Chevreuse */
  forElmts?: ElementType[];
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

export type LevelScale_Character = {
  talent: Talent;
  /** If [value] = 0: buff value * level. Otherwise buff value * TALENT_LV_MULTIPLIERS[value][level]. */
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  alterIndex?: number;
  /** On Raiden */
  max?: number;
};

// ============ BUFFS ============

export type ExtraMax_Character = UsableCondition_Character & {
  value: number;
};

export type DynamicMax_Character = {
  value: number;
  extras: ExtraMax_Character[];
};

type InputStack = {
  type: "input";
  /** Default to 0 */
  index?: number;
  /** When this bonus is from teammate, this is input's index to get stacks. */
  alterIndex?: number;
  /** On Wanderer */
  capacity?: {
    value: number;
    extra: UsableCondition_Character & {
      value: number;
    };
  };
};

type AttributeStack = {
  type: "attribute";
  field: "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";
  /** When this bonus is from teammate, this is input's index to get value. Default to 0 */
  alterIndex?: number;
};

type NationStack = {
  /** On Charlotte */
  type: "nation";
  nation: "same" | "different";
};

type EnergyStack = {
  /** On Raiden Shogun */
  type: "energy";
};

type ResolveStack = {
  /** On Raiden Shogun */
  type: "resolve";
};

export type BonusStack_Character = (InputStack | AttributeStack | NationStack | EnergyStack | ResolveStack) & {
  /** Final stack = stack - required base */
  baseline?: number;
  /** On Furina */
  extra?: AvailableCondition_Character & {
    value: number;
  };
  /** Dynamic on Mika */
  max?: number | DynamicMax_Character;
};

export type ValueOption_Character = {
  /** On Navia */
  preOptions?: number[];
  options: number[];
  indexSrc:
    | {
        type: "vision";
        visionType: "various" | ElementType | ElementType[];
      }
    | {
        /** On Neuvillette */
        type: "input";
        index?: number;
      }
    | {
        /** On Razor */
        type: "level";
        talent: Talent;
      };
  /** Add to indexSrc. On Nahida */
  extra?: AvailableCondition_Character & {
    value: number;
  };
  /** Max index. Dynamic on Navia */
  max?: number | DynamicMax_Character;
};

export type BonusConfig_Character = ExtendedUsableCondition_Character & {
  value: number | ValueOption_Character;
  /** Multiplier based on talent level */
  lvScale?: LevelScale_Character;
  /** Added before stacks, after scale */
  preExtra?: number | BonusConfig_Character;
  /** Index of pre-calculated stack */
  stackIndex?: number;
  stacks?: BonusStack_Character | BonusStack_Character[];
  max?:
    | number
    | {
        value: number;
        /** On Hu Tao */
        stacks?: BonusStack_Character;
        /** On Xianyun */
        extras?: ExtraMax_Character | ExtraMax_Character[];
      };
};

export type Bonus_Character = BonusConfig_Character & {
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
  };
};

export type InnateBuff_Character = Modifier_Character & {
  cmnStacks?: Bonus_Character["stacks"];
  effects?: Bonus_Character | Bonus_Character[];
};

export type Buff_Character = InnateBuff_Character & {
  /** This is id */
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  infuseConfig?: {
    overwritable: boolean;
    range?: ("NA" | "CA" | "PA")[];
    disabledNAs?: boolean;
  };
};

// ============ DEBUFFS ============

type PenaltyTarget =
  | ResistanceReductionKey
  | {
      type: "inp_elmt";
      /** Input's index to get ElementType index. Default to 0 */
      index?: number;
    };

export type PenaltyConfig_Character = ExtendedUsableCondition_Character & {
  value: number;
  lvScale?: LevelScale_Character;
  /** Added before stacks, after scale */
  preExtra?: number | PenaltyConfig_Character;
  index?: number;
  max?: number;
};

export type Penalty_Character = PenaltyConfig_Character & {
  targets: PenaltyTarget | PenaltyTarget[];
};

export type Debuff_Character = Modifier_Character & {
  /** This is id */
  index: number;
  affect?: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  effects?: Penalty_Character;
};
