import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackPattern,
  AttributeStat,
  CalcItemBasedOn,
  CalcItemFactor,
  CalcItemType,
  ElementType,
  EnhanceType,
  LevelableTalentType,
  LunarType,
  Nation,
  NormalAttack,
  TalentCalcItemBonusId,
  WeaponType,
} from "./common";
import type { BuffSpec, DebuffSpec, EffectPerformableConditionSpecs, InputCheckSpec } from "./modifier-specs";

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
  enhanceType?: EnhanceType;
  EBcost: number;
  talentLvBonus?: Partial<Record<LevelableTalentType, number>>;
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

type CharacterModifierBase = EffectPerformableConditionSpecs & {
  src: string;
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
  /** Factors multiplying an attribute, scaling off talent level (character) or refinement (weapon) */
  factor: CalcItemFactor | CalcItemFactor[];
  flatFactor?: CalcItemFlatFactor;

  // Only on 'attack'

  noU?: boolean;
  jointFactors?: boolean;
  attPatt?: ActualAttackPattern;
  attElmt?: ActualAttackElement;
  subAttPatt?: "FCA";
  lunar?: LunarType;
};

// ========== BUFF / BONUS ==========

export type AttackAlterSpec = {
  checkInput?: number | InputCheckSpec;
  /** Default "ALL" */
  forPatt?: "ALL" | NormalAttack | NormalAttack[] | TalentCalcItemBonusId[];
  attPatt?: AttackPattern;
  attElmt?: ElementType | "phec";
  disabled?: boolean;
};

export type CharacterBuff = CharacterModifierBase &
  BuffSpec & {
    alterConfigs?: AttackAlterSpec | AttackAlterSpec[];
  };

export type CharacterInnateBuff = CharacterModifierBase & Pick<BuffSpec, "effects">;

// ============ DEBUFF / PENALTY ============

export type CharacterDebuff = CharacterModifierBase & DebuffSpec;
