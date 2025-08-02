import {
  AMPLIFYING_REACTIONS,
  ARTIFACT_TYPES,
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  BONUS_KEYS,
  CORE_STAT_TYPES,
  ELEMENT_TYPES,
  LEVELS,
  LUNAR_REACTIONS,
  NORMAL_ATTACKS,
  QUICKEN_REACTIONS,
  REACTIONS,
  TALENT_TYPES,
  TRANSFORMATIVE_REACTIONS,
  WEAPON_TYPES,
} from "../constants";

export type WeaponType = (typeof WEAPON_TYPES)[number];

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export type TalentType = (typeof TALENT_TYPES)[number];

export type LevelableTalentType = Exclude<TalentType, "altSprint">;

export type AttackBonusKey = (typeof BONUS_KEYS)[number];

export type Level = (typeof LEVELS)[number];

// ========== ELEMENTS ==========

export type ElementType = (typeof ELEMENT_TYPES)[number];

export type AttackElement = (typeof ATTACK_ELEMENTS)[number];

export type ActualAttackElement = AttackElement | "absorb";

// ========== PATTERN ==========

export type NormalAttack = (typeof NORMAL_ATTACKS)[number];

export type AttackPattern = (typeof ATTACK_PATTERNS)[number];

export type ActualAttackPattern = AttackPattern | "none";

export type AttackTag = "lunarCharged";

//

export type TalentCalcItemBonusId = `id.${number}`;

export type AttackBonusType =
  | "all"
  | AttackPattern
  | AttackElement
  | `${AttackPattern}.${AttackElement}`
  | ReactionType
  | TalentCalcItemBonusId;

export type CalcItemType = "attack" | "healing" | "shield" | "other";

export type CalcItemBasedOn = "atk" | "def" | "hp" | "em";

export type CalcItemMultFactor =
  | number
  | {
      root: number;
      /** On characters only: When 0 stat not scale off talent level */
      scale?: number;
      /** On weapons only: multiplied by refi. Default to 1/3 [root] */
      incre?: number;
      /** Default to 'atk' */
      basedOn?: CalcItemBasedOn;
    };

// ========== REACTIONS ==========

export type AmplifyingReaction = (typeof AMPLIFYING_REACTIONS)[number];

export type TransformativeReaction = (typeof TRANSFORMATIVE_REACTIONS)[number];

export type QuickenReaction = (typeof QUICKEN_REACTIONS)[number];

export type LunarReaction = (typeof LUNAR_REACTIONS)[number];

export type ReactionType = (typeof REACTIONS)[number];

// ========== RESISTANCE REDUCTION ==========

export type ResistReductionKey = AttackElement | "def";
export type ResistReduction = Record<ResistReductionKey, number>;

//

export type CoreStat = (typeof CORE_STAT_TYPES)[number];

export type AttributeStat = (typeof ATTRIBUTE_STAT_TYPES)[number];
