import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttributeStat,
  ElementType,
  TalentType,
  WeaponType,
} from "./common.types";
import type {
  EntityBonus,
  EntityBuff,
  EntityDebuff,
  EntityEffectMax,
  ApplicableCondition,
  CalcItemType,
  CharacterMilestone,
  InputCheck,
  ModifierAffectType,
  WithBonusTargets,
  WithPenaltyTargets,
  EntityEffectExtra,
} from "./app-entity.types";

type Nation = "outland" | "mondstadt" | "liyue" | "inazuma" | "sumeru" | "natlan" | "fontaine" | "snezhnaya";

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
  extra?: EntityEffectExtra;
  /** Max optIndex. Dynamic on Navia */
  max?: EntityEffectMax;
};

type CharacterBonusExtends = {
  /** Multiplier based on talent level */
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterBonusCore;
  max?: EntityEffectMax;
};

export type CharacterBonusCore = EntityBonus<CharacterEffectValueOptionExtends> & CharacterBonusExtends;

type CharacterBonus = WithBonusTargets<CharacterBonusCore>;

type CharacterInnateBuff = CharacterModifier & Pick<CharacterBuff, "trackId" | "cmnStacks" | "effects">;

export type CharacterBuff = EntityBuff<CharacterBonus> &
  CharacterModifier & {
    infuseConfig?: {
      checkInput?: number | InputCheck;
      overwritable: boolean;
      range?: ("NA" | "CA" | "PA")[];
      disabledNAs?: boolean;
    };
  };

// ============ DEBUFF / PENALTY ============

export type CharacterPenaltyCore = ApplicableCondition & {
  value: number;
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterPenaltyCore;
  // index?: number;
  max?: number;
};

export type CharacterPenalty = WithPenaltyTargets<CharacterPenaltyCore>;

export type CharacterDebuff = EntityDebuff<CharacterPenalty> &
  CharacterModifier & {
    affect?: ModifierAffectType;
  };
