import type {
  CharacterMilestone,
  EntityBonusEffect,
  EntityBuff,
  EntityDebuff,
  EntityPenaltyEffect,
  InputCheck,
  ModifierAffectType,
} from "./app-entity";
import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackPattern,
  AttributeStat,
  CalcItemBasedOn,
  CalcItemMultFactor,
  CalcItemType,
  ElementType,
  LunarType,
  NormalAttack,
  TalentCalcItemBonusId,
  TalentType,
  WeaponType,
} from "./common.types";

export type AppCharacter = {
  code: number;
  name: string;
  beta?: boolean;
  GOOD?: string;
  icon: string;
  sideIcon: string;
  rarity: number;
  nation: Nation;
  faction?: Faction | Faction[];
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
    NA: TalentCalcItem[];
    CA: TalentCalcItem[];
    PA: TalentCalcItem[];
    ES: TalentCalcItem[];
    EB: TalentCalcItem[];
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

type Nation =
  | "nodkrai"
  | "outland"
  | "mondstadt"
  | "liyue"
  | "inazuma"
  | "sumeru"
  | "natlan"
  | "fontaine"
  | "snezhnaya";

type Faction = "moonsign";

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

type CalcListConfig = {
  scale?: number;
  basedOn?: CalcItemBasedOn;
  attPatt?: ActualAttackPattern;
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

export type TalentCalcItem = {
  id?: TalentCalcItemBonusId;
  type?: CalcItemType;
  name: string;
  notOfficial?: boolean;
  /** Factors multiplying an attribute, scaling off talent level (character) or refinement (weapon) */
  multFactors: CalcItemMultFactor | CalcItemMultFactor[];
  flatFactor?: CalcItemFlatFactor;

  // Only on 'attack'

  joinMultFactors?: boolean;
  attPatt?: ActualAttackPattern;
  attElmt?: ActualAttackElement;
  subAttPatt?: "FCA";
  lunar?: LunarType;
};

// type _TalentCalcItem = PartiallyOptional<TalentCalcItem, "type">;

// ========== BUFF / BONUS ==========

export type CharacterBonusEffect = EntityBonusEffect;

export type CharacterInnateBuff = CharacterModifier & Pick<CharacterBuff, "unstackableId" | "effects">;

export type CharacterBuffNormalAttackConfig = {
  checkInput?: number | InputCheck;
  forPatt?: "ALL" | NormalAttack;
  attPatt?: AttackPattern;
  attElmt?: ElementType;
  disabled?: boolean;
};

export type CharacterBuff = EntityBuff<CharacterBonusEffect> &
  CharacterModifier & {
    normalsConfig?: CharacterBuffNormalAttackConfig | CharacterBuffNormalAttackConfig[];
  };

// ============ DEBUFF / PENALTY ============

type CharacterPenaltyEffect = EntityPenaltyEffect;

export type CharacterDebuff = EntityDebuff<CharacterPenaltyEffect> &
  CharacterModifier & {
    affect?: ModifierAffectType;
  };
