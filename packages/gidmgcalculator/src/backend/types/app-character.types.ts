import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackPattern,
  AttributeStat,
  CalcItemBasedOn,
  ElementType,
  NormalAttack,
  TalentType,
  WeaponType,
  CalcItemType,
  CalcItemMultFactor,
  TalentCalcItemBonusId,
} from "./common.types";
import type {
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

type TalentCalcItemCommon = {
  id?: TalentCalcItemBonusId;
  name: string;
  notOfficial?: boolean;
};

export type TalentCalcItemAttack = TalentCalcItemCommon & {
  type: Extract<CalcItemType, "attack">;
  /** Factors multiplying an attribute, scaling off talent level (character) or refinement (weapon) */
  multFactors: CalcItemMultFactor | CalcItemMultFactor[];
  joinMultFactors?: boolean;

  attPatt?: ActualAttackPattern;
  attElmt?: ActualAttackElement;
  subAttPatt?: "FCA";
};

type TalentCalcItemOther = TalentCalcItemCommon & {
  type: Exclude<CalcItemType, "attack">;
  multFactors: CalcItemMultFactor;
  /** Factor multiplying root, scaling on talent level. Only on ES / EB */
  flatFactor?: CalcItemFlatFactor;
};

export type TalentCalcItem = TalentCalcItemAttack | TalentCalcItemOther;

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
