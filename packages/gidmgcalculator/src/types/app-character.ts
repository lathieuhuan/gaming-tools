import type {
  CharacterMilestone,
  EntityBonusEffect,
  EntityBuff,
  EntityDebuff,
  EntityPenaltyEffect,
  InputCheck,
  PartyMilestone,
} from "./app-entity";
import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackPattern,
  AttributeStat,
  CalcItemBasedOn,
  CalcItemFactor,
  CalcItemType,
  ElementType,
  LunarType,
  Nation,
  NormalAttack,
  TalentCalcItemBonusId,
  TalentType,
  WeaponType,
} from "./common";

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
  enhanceType?: "WITCH";
  EBcost: number;
  talentLvBonus?: Partial<Record<TalentType, number>>;
  statBases: {
    atk: StatBase;
    def: StatBase;
    hp: StatBase;
  };
  statInnates?: StatOther[];
  statBonus: StatOther;
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

type Faction = "moonsign";

type Ability = {
  name: string;
  image?: string;
  description?: string;
};

type StatBase = {
  level: number;
  ascension: number;
};

type StatOther = {
  type: AttributeStat;
  value: number;
};

// COMMON

type CharacterModifier = {
  src: string;
  grantedAt?: CharacterMilestone;
  partyMs?: PartyMilestone;
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
  factor: CalcItemFactor | CalcItemFactor[];
  flatFactor?: CalcItemFlatFactor;

  // Only on 'attack'

  jointFactors?: boolean;
  attPatt?: ActualAttackPattern;
  attElmt?: ActualAttackElement;
  subAttPatt?: "FCA";
  lunar?: LunarType;
};

// type _TalentCalcItem = PartiallyOptional<TalentCalcItem, "type">;

// ========== BUFF / BONUS ==========

export type CharacterBonusEffect = EntityBonusEffect;

export type CharacterInnateBuff = CharacterModifier & Pick<CharacterBuff, "effects">;

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

export type CharacterDebuff = EntityDebuff<CharacterPenaltyEffect> & CharacterModifier;
