/** Don't change the items order of any array below */

export const ELEMENT_TYPES = ["pyro", "hydro", "electro", "cryo", "geo", "anemo", "dendro"] as const;

export const WEAPON_TYPES = ["sword", "claymore", "catalyst", "polearm", "bow"] as const;

export const ARTIFACT_TYPES = ["flower", "plume", "sands", "goblet", "circlet"] as const;

export const LEVELS = [
  "1/20",
  "20/20",
  "20/40",
  "40/40",
  "40/50",
  "50/50",
  "50/60",
  "60/60",
  "60/70",
  "70/70",
  "70/80",
  "80/80",
  "80/90",
  "90/90",
] as const;

/** ========== TALENTS ========== */

export const TALENT_TYPES = ["NAs", "ES", "EB", "altSprint"] as const;

export const NORMAL_ATTACKS = ["NA", "CA", "PA"] as const;

export const ATTACK_PATTERNS = [...NORMAL_ATTACKS, "ES", "EB"] as const;

export const ATTACK_PATTERN_INFO_KEYS = ["pct_", "flat", "cRate_", "cDmg_", "mult_", "defIgn_", "multPlus"] as const;

export const ATTACK_ELEMENTS = [...ELEMENT_TYPES, "phys"] as const;

export const ATTACK_ELEMENT_INFO_KEYS = ["flat", "cRate_", "cDmg_"] as const;

export const REACTION_BONUS_INFO_KEYS = ["pct_", "cRate_", "cDmg_"] as const;

/** ========== REACTIONS ========== */

export const TRANSFORMATIVE_REACTIONS = [
  "bloom",
  "hyperbloom",
  "burgeon",
  "burning",
  "swirl",
  "superconduct",
  "electroCharged",
  "overloaded",
  "shattered",
] as const;

export const QUICKEN_REACTIONS = ["spread", "aggravate"] as const;

export const AMPLIFYING_REACTIONS = ["melt", "vaporize"] as const;

export const REACTIONS = [...TRANSFORMATIVE_REACTIONS, ...QUICKEN_REACTIONS, ...AMPLIFYING_REACTIONS] as const;

export const RESONANCE_ELEMENT_TYPES = ["pyro", "cryo", "geo", "hydro", "dendro"];

/** ========== STATS ========== */

export const BASE_STAT_TYPES = ["base_hp", "base_atk", "base_def"] as const;

export const CORE_STAT_TYPES = ["hp", "atk", "def"] as const;

export const ATTRIBUTE_STAT_TYPES = [
  ...CORE_STAT_TYPES,
  "hp_",
  "atk_",
  "def_",
  "em",
  "er_",
  "cRate_",
  "cDmg_",
  ...ATTACK_ELEMENTS,
  "healB_",
  "inHealB_",
  "shieldS_",
  "naAtkSpd_",
  "caAtkSpd_",
] as const;

export const ARTIFACT_SUBSTAT_TYPES = [
  "hp",
  "hp_",
  "atk",
  "atk_",
  "def",
  "def_",
  "em",
  "er_",
  "cRate_",
  "cDmg_",
] as const;
