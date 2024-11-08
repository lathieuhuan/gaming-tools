import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackPattern,
  AttributeStat,
  ElementType,
  ExclusiveBonusType,
  NormalAttack,
  TalentType,
  WeaponType,
} from "./common.types";
import type {
  CalcItemType,
  CharacterMilestone,
  EntityBonus,
  EntityBonusCore,
  EntityBuff,
  EntityDebuff,
  EntityPenalty,
  EntityPenaltyCore,
  InputCheck,
  ModifierAffectType,
} from "./app-entity";

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
  calcListConfig?: {
    NA?: CalcListConfig;
    CA?: CalcListConfig;
    PA?: CalcListConfig;
    ES?: CalcListConfig;
    EB?: CalcListConfig;
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

type Nation = "outland" | "mondstadt" | "liyue" | "inazuma" | "sumeru" | "natlan" | "fontaine" | "snezhnaya";

type Ability = {
  name: string;
  image?: string;
  description?: string;
};

// COMMON

type CharacterModifier = {
  src: string;
  grantedAt?: CharacterMilestone | undefined;
  description: string;
};

// ========== CALC ITEM ==========

export type TalentAttributeType = "atk" | "def" | "hp" | "em";

type CalcListConfig = {
  scale?: number;
  basedOn?: TalentAttributeType;
  attPatt?: ActualAttackPattern;
};

export type CalcItemMultFactor =
  | number
  | {
      root: number;
      /** When 0 stat not scale off talent level */
      scale?: number;
      /** Calc default to 'atk'. Only on ES / EB */
      basedOn?: TalentAttributeType;
    };

export type CalcItemFlatFactor =
  | number
  | {
      root: number;
      /**
       * Calc default to getTalentDefaultInfo's return.flatFactorScale.
       * When 0 not scale off talent level.
       */
      scale?: number;
    };

export type CalcItem = {
  id?: ExclusiveBonusType;
  name: string;
  type?: CalcItemType;
  notOfficial?: boolean;
  attPatt?: ActualAttackPattern;
  attElmt?: ActualAttackElement;
  subAttPatt?: "FCA";
  /**
   * Damage factors multiplying an attribute, scaling off talent level
   */
  multFactors: CalcItemMultFactor | CalcItemMultFactor[];
  joinMultFactors?: boolean;
  /**
   * Damage factor multiplying root, caling off talent level. Only on ES / EB
   */
  flatFactor?: CalcItemFlatFactor;
};

// ========== BUFF / BONUS ==========

export type CharacterBonusCore = EntityBonusCore;

type CharacterInnateBuff = CharacterModifier & Pick<CharacterBuff, "unstackableId" | "effects">;

export type CharacterBuffNormalAttackConfig = {
  checkInput?: number | InputCheck;
  forPatt?: "ALL" | NormalAttack;
  attPatt?: AttackPattern;
  attElmt?: ElementType;
  disabled?: boolean;
};

export type CharacterBuff = EntityBuff<EntityBonus<CharacterBonusCore>> &
  CharacterModifier & {
    normalsConfig?: CharacterBuffNormalAttackConfig | CharacterBuffNormalAttackConfig[];
  };

// ============ DEBUFF / PENALTY ============

export type CharacterPenaltyCore = EntityPenaltyCore;

type CharacterPenalty = EntityPenalty<CharacterPenaltyCore>;

export type CharacterDebuff = EntityDebuff<CharacterPenalty> &
  CharacterModifier & {
    affect?: ModifierAffectType;
  };
