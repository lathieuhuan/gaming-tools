import type { BuffSpec, DebuffSpec } from "./modifier-specs";

export type AppArtifact = {
  /** This is id */
  code: number;
  beta?: boolean;
  name: string;
  variants: number[];
  flower: ArtifactTypeData;
  plume: ArtifactTypeData;
  sands: ArtifactTypeData;
  goblet: ArtifactTypeData;
  circlet: ArtifactTypeData;
  descriptions: string[];
  setBonuses?: SetBonus[];
  buffs?: ArtifactBuff[];
  debuffs?: ArtifactDebuff[];
};

type ArtifactTypeData = {
  name: string;
  icon: string;
};

type SetBonus = {
  description?: number[];
  effects?: ArtifactBuff["effects"];
};

// ========== BUFF / BONUS ==========

export type ArtifactModDescription = string | number | number[];

export type ArtifactBuff = BuffSpec & {
  /** 0 is 2-piece set, 1 is 4-piece set. Default 1 */
  bonusLv?: number;
  description: ArtifactModDescription;
};

// ============ DEBUFF / PENALTY ============

export type ArtifactDebuff = DebuffSpec & {
  description: ArtifactModDescription;
};
