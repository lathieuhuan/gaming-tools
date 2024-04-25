export const ELEMENT_TYPES = ["pyro", "hydro", "electro", "cryo", "geo", "anemo", "dendro"] as const;

export const WEAPON_TYPES = ["sword", "claymore", "catalyst", "polearm", "bow"] as const;

export const TALENT_TYPES = ["NAs", "ES", "EB", "altSprint"] as const;

//

const NORMAL_ATTACKS = ["NA", "CA", "PA"] as const;

export const ATTACK_PATTERNS = [...NORMAL_ATTACKS, "ES", "EB"] as const;

export const ATTACK_PATTERN_INFO_KEYS = ["pct_", "flat", "cRate_", "cDmg_", "mult_", "defIgn_", "multPlus"] as const;

export const ATTACK_ELEMENTS = [...ELEMENT_TYPES, "phys"] as const;

export const ATTACK_ELEMENT_INFO_KEYS = ["flat", "cRate_", "cDmg_"] as const;

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

export const REACTION_BONUS_INFO_KEYS = ["pct_", "cRate_", "cDmg_"] as const;

//

const CORE_STAT_TYPES = ["hp", "atk", "def"] as const;

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
