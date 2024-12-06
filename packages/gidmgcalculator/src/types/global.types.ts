import type { ArtifactType, AttributeStat, Level, WeaponType } from "@Backend";

export type Traveler = "LUMINE" | "AETHER";

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
