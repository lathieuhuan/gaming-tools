import type {
  ActualAttackElement,
  AttackPattern,
  AttributeStat,
  ElementType,
  TalentType,
  WeaponType,
} from "./common.types";
import type {
  AppBonus,
  AppBonusAttributeStack,
  AppBonusNationStack,
  AppBuff,
  AppDebuff,
  CalcItemType,
  InputCheck,
  ModifierAffectType,
  WithBonusTargets,
  WithPenaltyTargets,
} from "./app-entity.types";

type Nation = "outland" | "mondstadt" | "liyue" | "inazuma" | "sumeru" | "natlan" | "fontaine" | "snezhnaya";

type ActualAttackPattern = AttackPattern | "none";

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
  talentLvBonus?: Partial<Record<TalentType, number>>;
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

type Ability = {
  name: string;
  image?: string;
  description?: string;
};

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C4" | "C6";

type CharacterModifier = {
  src: string;
  grantedAt?: CharacterMilestone | undefined;
  description: string;
};

// ========== CALC ITEM ==========

export type TalentAttributeType = "atk" | "def" | "hp" | "em";

type MultFactorConfig = {
  scale?: number;
  basedOn?: TalentAttributeType;
};

type CalcItemMultFactor = {
  root: number;
  /** When 0 stat not scale off talent level */
  scale?: number;
  /** Calc default to 'atk'. Only on ES / EB */
  basedOn?: TalentAttributeType;
};

type CalcItem = {
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

// ========== CONDITIONS ==========

export type CharacterEffectAvailableCondition = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  alterIndex?: number;
};

export type CharacterEffectUsableCondition = CharacterEffectAvailableCondition & {
  checkInput?: number | InputCheck;
};

type CharacterEffectOtherUsableCondition = {
  /** On Chongyun */
  forWeapons?: WeaponType[];
  /** On Chevreuse */
  forElmts?: ElementType[];
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

export type CharacterEffectExtendedUsableCondition = CharacterEffectUsableCondition &
  CharacterEffectOtherUsableCondition;

// ========== EXTRA ==========

type CharacterEffectExtra = CharacterEffectAvailableCondition & {
  value: number;
};

// ========== BONUS STACKS ==========

type InputStack = {
  type: "INPUT";
  /** Default to 0 */
  index?: number;
  /** When this bonus is from teammate, this is input's index to get stacks. */
  alterIndex?: number;
  /** On Wanderer */
  // #to-check: why not use max on CharacterBonusStack
  capacity?: {
    value: number;
    extra: CharacterEffectUsableCondition & {
      value: number;
    };
  };
};
type AttributeStack = AppBonusAttributeStack & {
  /** When this bonus is from teammate, this is input's index to get value. Default to 0 */
  alterIndex?: number;
};
type EnergyStack = {
  /** On Raiden Shogun */
  type: "ENERGY";
};
type ResolveStack = {
  /** On Raiden Shogun */
  type: "RESOLVE";
};

export type CharacterBonusStack = (InputStack | AttributeStack | AppBonusNationStack | EnergyStack | ResolveStack) & {
  /** Final stack = stack - baseline */
  baseline?: number;
  /** On Furina */
  extra?: CharacterEffectExtra;
  /** Dynamic on Mika */
  max?: CharacterEffectMax;
};

// ========== BONUS MAX ==========

export type CharacterEffectExtraMax = CharacterEffectUsableCondition & {
  value: number;
};

type CharacterEffectDynamicMax = {
  value: number;
  /** On Hu Tao */
  stacks?: CharacterBonusStack;
  extras?: CharacterEffectExtraMax | CharacterEffectExtraMax[];
};

export type CharacterEffectMax = number | CharacterEffectDynamicMax;

// ========== BUFF / BONUS ==========

export type CharacterEffectLevelScale = {
  talent: TalentType;
  /** If [value] = 0: buff value * level. Otherwise buff value * TALENT_LV_MULTIPLIERS[value][level]. */
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  alterIndex?: number;
  /** On Raiden */
  max?: number;
};

type CharacterEffectValueOptionExtends = {
  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Nahida */
  extra?: CharacterEffectExtra;
  /** Max optIndex. Dynamic on Navia */
  max?: CharacterEffectMax;
};

type CharacterBonusExtends = {
  /** Multiplier based on talent level */
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterBonusCore;
  max?: CharacterEffectMax;
};

export type CharacterBonusCore = AppBonus<CharacterBonusStack, CharacterEffectValueOptionExtends> &
  CharacterEffectAvailableCondition &
  CharacterEffectOtherUsableCondition &
  CharacterBonusExtends;

type CharacterBonus = WithBonusTargets<CharacterBonusCore>;

type CharacterInnateBuff = CharacterModifier & Pick<CharacterBuff, "trackId" | "cmnStacks" | "effects">;

export type CharacterBuff = AppBuff<CharacterBonus> &
  CharacterModifier & {
    infuseConfig?: {
      checkInput?: number | InputCheck;
      overwritable: boolean;
      range?: ("NA" | "CA" | "PA")[];
      disabledNAs?: boolean;
    };
  };

// ============ DEBUFF / PENALTY ============

export type CharacterPenaltyCore = CharacterEffectExtendedUsableCondition & {
  value: number;
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterPenaltyCore;
  // index?: number;
  max?: number;
};

export type CharacterPenalty = WithPenaltyTargets<CharacterPenaltyCore>;

type CharacterDebuff = AppDebuff<CharacterPenalty> &
  CharacterModifier & {
    affect?: ModifierAffectType;
  };
