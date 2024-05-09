import {
  AMPLIFYING_REACTIONS,
  ARTIFACT_TYPES,
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  ATTACK_PATTERN_INFO_KEYS,
  ATTRIBUTE_STAT_TYPES,
  CORE_STAT_TYPES,
  ELEMENT_TYPES,
  NORMAL_ATTACKS,
  QUICKEN_REACTIONS,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
  TALENT_TYPES,
  TRANSFORMATIVE_REACTIONS,
  WEAPON_TYPES,
} from "../constants";

export type WeaponType = (typeof WEAPON_TYPES)[number];

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export type TalentType = (typeof TALENT_TYPES)[number];

export type LevelableTalentType = Exclude<TalentType, "altSprint">;

// ========== ELEMENTS ==========

export type ElementType = (typeof ELEMENT_TYPES)[number];

export type AttackElement = (typeof ATTACK_ELEMENTS)[number];

export type ActualAttackElement = AttackElement | "absorb";

export type AttackElementInfoKey = (typeof ATTACK_ELEMENT_INFO_KEYS)[number];
export type AttackElementPath = `${AttackElement}.${AttackElementInfoKey}`;

export type AttacklementInfo = Record<AttackElementInfoKey, number>;
export type AttackElementBonus = Record<AttackElement, AttacklementInfo>;

// ========== PATTERN ==========

export type NormalAttack = (typeof NORMAL_ATTACKS)[number];

export type AttackPattern = (typeof ATTACK_PATTERNS)[number];

export type ActualAttackPattern = AttackPattern | "none";

export type AttackPatternBonusKey = AttackPattern | "all";
export type AttackPatternInfoKey = (typeof ATTACK_PATTERN_INFO_KEYS)[number];
export type AttackPatternPath = `${AttackPatternBonusKey}.${AttackPatternInfoKey}`;

export type AttackPatternInfo = Record<AttackPatternInfoKey, number>;
export type AttackPatternBonus = Record<AttackPatternBonusKey, AttackPatternInfo>;

// ========== PATTERN ELEMENT ==========

export type AttackPatternElementBonusKey = ElementType | "all";
export type AttackPatternElementInfoKey = "pct_" | "flat";
export type AttackPatternElementPath = `${AttackPatternElementBonusKey}.${AttackPatternElementInfoKey}`;

export type AttackPatternElementInfo = Record<AttackPatternElementInfoKey, number>;
export type AttackPatternElementBonus = Record<`NA.${AttackPatternElementBonusKey}`, AttackPatternElementInfo>;

// ========== REACTIONS ==========

export type AmplifyingReaction = (typeof AMPLIFYING_REACTIONS)[number];

export type TransformativeReaction = (typeof TRANSFORMATIVE_REACTIONS)[number];

export type QuickenReaction = (typeof QUICKEN_REACTIONS)[number];

export type ReactionType = (typeof REACTIONS)[number];

export type ReactionBonusInfoKey = (typeof REACTION_BONUS_INFO_KEYS)[number];
export type ReactionBonusPath = `${ReactionType}.${ReactionBonusInfoKey}`;

export type ReactionBonusInfo = Record<ReactionBonusInfoKey, number>;
export type ReactionBonus = Record<ReactionType, ReactionBonusInfo>;

// ========== RESISTANCE REDUCTION ==========

export type ResistanceReductionKey = AttackElement | "def";
export type ResistanceReduction = Record<ResistanceReductionKey, number>;

//

export type CoreStat = (typeof CORE_STAT_TYPES)[number];

export type AttributeStat = (typeof ATTRIBUTE_STAT_TYPES)[number];
