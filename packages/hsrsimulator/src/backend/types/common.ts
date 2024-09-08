import { COMBAT_TYPES, PATH_TYPES, STAT_TYPES } from "../constants";

export type PathType = (typeof PATH_TYPES)[number];

export type CombatType = (typeof COMBAT_TYPES)[number];

export type StatType = (typeof STAT_TYPES)[number];
