import { COMBAT_TYPES, PATH_TYPES } from "../constants";

export type PathType = (typeof PATH_TYPES)[number];

export type CombatType = (typeof COMBAT_TYPES)[number];

export type StatType =
  | "hp"
  | "hp_"
  | "atk"
  | "atk_"
  | "def"
  | "def_"
  | "spd"
  | "spd_"
  | "taunt"
  | "cRate_"
  | "cDmg_"
  | "break_"
  | "heal_"
  | "er_"
  | "effHit_"
  | "effRes_"
  | "physical_"
  | "fire_"
  | "ice_"
  | "lightning_"
  | "wind_"
  | "quantum_"
  | "imaginary_";

export type AttackType = "basic" | "skill" | "ultimate" | "talent";

export type EntityStatusType = "SHIELDED" | "SLOWED" | "DEF-REDUCED";
