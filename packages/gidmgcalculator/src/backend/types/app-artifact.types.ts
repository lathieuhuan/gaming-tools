import type {
  EntityBonus,
  EntityBonusCore,
  EntityBuff,
  EntityDebuff,
  EntityPenalty,
  EntityPenaltyCore,
} from "./app-entity";

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

export type ArtifactBonusCore = EntityBonusCore<{
  max?: number;
}>;

type ArtifactBonus = EntityBonus<ArtifactBonusCore>;

export type ArtifactModifierDescription = string | number | number[];

type ArtifactBuff = EntityBuff<ArtifactBonus> & {
  /** 0 is 2-piece set, 1 is 4-piece set. Default to 1 */
  bonusLv?: number;
  description: ArtifactModifierDescription;
};

export type ArtifactPenaltyCore = EntityPenaltyCore;

type ArtifactPenalty = EntityPenalty<ArtifactPenaltyCore>;

type ArtifactDebuff = EntityDebuff<ArtifactPenalty> & {
  description: ArtifactModifierDescription;
};
