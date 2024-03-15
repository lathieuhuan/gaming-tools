import {
  AMPLIFYING_REACTIONS,
  ARTIFACT_TYPES,
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  BASE_STAT_TYPES,
  ELEMENT_TYPES,
  LEVELS,
  NORMAL_ATTACKS,
  QUICKEN_REACTIONS,
  REACTIONS,
  TALENT_TYPES,
  WEAPON_TYPES,
} from "@Src/constants";

export type Nation = "outland" | "mondstadt" | "liyue" | "inazuma" | "sumeru" | "natlan" | "fontaine" | "snezhnaya";

export type Level = (typeof LEVELS)[number];

export type ElementType = (typeof ELEMENT_TYPES)[number];

export type WeaponType = (typeof WEAPON_TYPES)[number];

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/** ========== TALENTS ========== */

export type NormalAttack = (typeof NORMAL_ATTACKS)[number];

export type Talent = (typeof TALENT_TYPES)[number];

export type AttackElement = (typeof ATTACK_ELEMENTS)[number];

export type AttackPattern = (typeof ATTACK_PATTERNS)[number];

/** ========== REACTIONS ========== */

export type AmplifyingReaction = (typeof AMPLIFYING_REACTIONS)[number];

export type QuickenReaction = (typeof QUICKEN_REACTIONS)[number];

export type Reaction = (typeof REACTIONS)[number];

export type AttackReaction = AmplifyingReaction | QuickenReaction | null;

/** ========== STATS ========== */

export type BaseStat = (typeof BASE_STAT_TYPES)[number];

export type AttributeStat = (typeof ATTRIBUTE_STAT_TYPES)[number];

export type TotalAttributeStat = BaseStat | AttributeStat;

/** ========== MODIFIERS ========== */

export type ModifierAffectType = "SELF" | "TEAMMATE" | "SELF_TEAMMATE" | "PARTY" | "ONE_UNIT" | "ACTIVE_UNIT";

export type ModInputType = "level" | "text" | "check" | "stacks" | "select" | "anemoable" | "dendroable";

export type ModInputConfig = {
  label?: string;
  type: ModInputType;
  for?: "self" | "team";
  /** See ModifierControl model for default value */
  initialValue?: number;
  max?: number;
  options?: string[];
};

/** ========== BASE MODELS ========== */

export type Character = {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
};

export type ArtifactSubStat = {
  type: AttributeStat;
  value: number;
};

export type Artifact = {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
};

export type Weapon = {
  ID: number;
  type: WeaponType;
  code: number;
  level: Level;
  refi: number;
};

// temporary, should make a util for message like notification
export type AppMessage = {
  active: boolean;
  type?: "error" | "success" | "info";
  content?: string;
  closable?: boolean;
};
