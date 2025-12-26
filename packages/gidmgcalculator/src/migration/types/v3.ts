import type { ArtifactSubStat, ArtifactType, AttributeStat, Level, WeaponType } from "@/types";

// ========== CHARACTER ==========

type Character = {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  weaponID: number;
  artifactIDs: (number | null)[];
};

// ========== WEAPON ==========

type Weapon = {
  ID: number;
  code: number;
  type: WeaponType;
  level: Level;
  refi: number;
  owner: string | null;
  setupIDs?: number[];
};

// ========== ARTIFACT ==========

type Artifact = {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
  owner: string | null;
  setupIDs?: number[];
};

export type DatabaseDataV3 = {
  version: 3;
  characters: Character[];
  weapons: Weapon[];
  artifacts: Artifact[];
  setups: unknown[]; // Lost to time
};
