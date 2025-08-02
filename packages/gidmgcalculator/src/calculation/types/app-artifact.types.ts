import type { EntityBonusEffect, EntityBuff, EntityDebuff, EntityPenaltyEffect } from "./app-entity";

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

type ArtifactBonusEffect = EntityBonusEffect;

export type ArtifactModifierDescription = string | number | number[];

type ArtifactBuff = EntityBuff<ArtifactBonusEffect> & {
  /** 0 is 2-piece set, 1 is 4-piece set. Default to 1 */
  bonusLv?: number;
  description: ArtifactModifierDescription;
};

// ============ DEBUFF / PENALTY ============

type ArtifactPenaltyEffect = EntityPenaltyEffect;

type ArtifactDebuff = EntityDebuff<ArtifactPenaltyEffect> & {
  description: ArtifactModifierDescription;
};
