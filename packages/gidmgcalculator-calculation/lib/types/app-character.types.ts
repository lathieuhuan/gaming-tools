import {
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
import { CharacterMilestone, InputCheck } from "./app-entity/effect-condition.types";
import { EntityBonusCore, EntityBonus } from "./app-entity/entity-bonus.types";
import { EntityBuff, EntityDebuff, ModifierAffectType } from "./app-entity/app-entity.types";
import { EntityPenalty, EntityPenaltyCore } from "./app-entity/entity-penalty.types";
import { CalcItemType } from "./app-entity/app-entity-common.types";
import { EffectMax } from "./app-entity/effect-max.types";

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

type TalentAttributeType = "atk" | "def" | "hp" | "em";

type CalcListConfig = {
  scale?: number;
  basedOn?: TalentAttributeType;
  attPatt?: ActualAttackPattern;
};

type CalcItemMultFactor =
  | number
  | {
      root: number;
      /** When 0 stat not scale off talent level */
      scale?: number;
      /** Calc default to 'atk'. Only on ES / EB */
      basedOn?: TalentAttributeType;
    };

type CalcItemFlatFactor =
  | number
  | {
      root: number;
      /**
       * Calc default to getTalentDefaultInfo's return.flatFactorScale.
       * When 0 not scale off talent level.
       */
      scale?: number;
    };

type CalcItem = {
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

type CharacterEffectLevelScale = {
  talent: TalentType;
  /** If [value] = 0: buff value * level. Otherwise buff value * TALENT_LV_MULTIPLIERS[value][level]. */
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  alterIndex?: number;
  /** On Raiden */
  max?: number;
};

type CharacterBonusCore = EntityBonusCore<{
  /** Multiplier based on talent level */
  lvScale?: CharacterEffectLevelScale;
  max?: EffectMax;
}>;

type CharacterBonus = EntityBonus<CharacterBonusCore>;

type CharacterInnateBuff = CharacterModifier & Pick<CharacterBuff, "unstackableId" | "effects">;

type CharacterBuffNAsConfig = {
  checkInput?: number | InputCheck;
  forPatt?: "ALL" | NormalAttack;
  attPatt?: AttackPattern;
  attElmt?: ElementType;
  disabled?: boolean;
};

type CharacterBuff = EntityBuff<CharacterBonus> &
  CharacterModifier & {
    normalsConfig?: CharacterBuffNAsConfig | CharacterBuffNAsConfig[];
  };

// ============ DEBUFF / PENALTY ============

type CharacterPenaltyCore = EntityPenaltyCore<{
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | CharacterPenaltyCore;
  max?: number;
}>;

type CharacterPenalty = EntityPenalty<CharacterPenaltyCore>;

type CharacterDebuff = EntityDebuff<CharacterPenalty> &
  CharacterModifier & {
    affect?: ModifierAffectType;
  };
