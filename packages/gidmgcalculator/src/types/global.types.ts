import type { AmplifyingReaction, ArtifactType, AttributeStat, Level, QuickenReaction, WeaponType } from "@Backend";
import { BASE_STAT_TYPES } from "@Src/constants";

export type AttackReaction = AmplifyingReaction | QuickenReaction | null;

/** #to-check: necessary */
export type BaseStat = (typeof BASE_STAT_TYPES)[number];

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
