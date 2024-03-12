import {
  AMPLIFYING_REACTIONS,
  ARTIFACT_TYPES,
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  ELEMENT_TYPES,
  LEVELS,
  QUICKEN_REACTIONS,
  REACTIONS,
  WEAPON_TYPES,
} from "@Src/constants";

export type Level = (typeof LEVELS)[number];

export type ElementType = (typeof ELEMENT_TYPES)[number];

export type WeaponType = (typeof WEAPON_TYPES)[number];

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/** ========== TALENTS ========== */

export type AttackElement = (typeof ATTACK_ELEMENTS)[number];

export type AttackPattern = (typeof ATTACK_PATTERNS)[number];

/** ========== REACTIONS ========== */

export type AmplifyingReaction = (typeof AMPLIFYING_REACTIONS)[number];

export type QuickenReaction = (typeof QUICKEN_REACTIONS)[number];

export type Reaction = (typeof REACTIONS)[number];

/** ========== STATS ========== */

export type AttributeStat = (typeof ATTRIBUTE_STAT_TYPES)[number];

/** ========== MODIFIERS ========== */

export type ModifierAffectType = "SELF" | "TEAMMATE" | "SELF_TEAMMATE" | "PARTY" | "ONE_UNIT" | "ACTIVE_UNIT";

export type ModInputType = "level" | "text" | "check" | "stacks" | "select" | "anemoable" | "dendroable";

export type ModInputConfig = {
  label?: string;
  type: ModInputType;
  for?: "self" | "team";
  /** See DEFAULT_MODIFIER_INITIAL_VALUES */
  initialValue?: number;
  max?: number;
  options?: string[];
};
