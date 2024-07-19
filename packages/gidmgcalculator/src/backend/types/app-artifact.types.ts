import type {
  EntityBonus,
  EntityBuff,
  EntityDebuff,
  EntityPenalty,
  WithBonusTargets,
  WithPenaltyTargets,
} from "./app-entity.types";

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

export type ArtifactBonusCore = EntityBonus & {
  /** Added before stacks. Not implement yet */
  preExtra?: number | ArtifactBonusCore;
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

export type ArtifactBuff = EntityBuff<ArtifactBonus> & {
  description: ArtifactModifierDescription;
};

export type ArtifactPenaltyCore = EntityPenalty;

type ArtifactPenalty = WithPenaltyTargets<ArtifactPenaltyCore>;

type ArtifactDebuff = EntityDebuff<ArtifactPenalty> & {
  description: ArtifactModifierDescription;
};
