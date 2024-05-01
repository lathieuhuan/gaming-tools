import type { AppBonus, AppBuff, AppDebuff, WithBonusTargets, WithPenaltyTargets } from "./app-entity.types";

type ArtTypeData = {
  name: string;
  icon: string;
};

export type AppArtifact = {
  /** This is id */
  code: number;
  beta?: boolean;
  name: string;
  variants: number[];
  flower: ArtTypeData;
  plume: ArtTypeData;
  sands: ArtTypeData;
  goblet: ArtTypeData;
  circlet: ArtTypeData;
  descriptions: string[];
  setBonuses?: SetBonus[];
  buffs?: ArtifactBuff[];
  debuffs?: ArtifactDebuff[];
};

export type ArtifactBonusCore = AppBonus & {
  /** Apply after stacks */
  sufExtra?: number | ArtifactBonusCore;
  max?: number;
};

type ArtifactBonus = WithBonusTargets<ArtifactBonusCore>;

type SetBonus = {
  description?: number[];
  effects?: ArtifactBuff["effects"];
};

export type ArtifactModifierDescription = string | number | number[];

export type ArtifactBuff = AppBuff<ArtifactBonus> & {
  description: ArtifactModifierDescription;
};

type ArtifactPenalty = WithPenaltyTargets<{
  value: number;
}>;

type ArtifactDebuff = AppDebuff<ArtifactPenalty> & {
  description: ArtifactModifierDescription;
};
