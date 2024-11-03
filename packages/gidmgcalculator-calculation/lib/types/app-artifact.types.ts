import { EntityBuff, EntityDebuff } from "./app-entity/app-entity.types";
import { EntityBonus, EntityBonusCore } from "./app-entity/entity-bonus.types";
import { EntityPenalty, EntityPenaltyCore } from "./app-entity/entity-penalty.types";

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

type ArtifactBonusCore = EntityBonusCore<{
  max?: number;
}>;

type ArtifactBonus = EntityBonus<ArtifactBonusCore>;

type ArtifactModifierDescription = string | number | number[];

type ArtifactBuff = EntityBuff<ArtifactBonus> & {
  /** 0 is 2-piece set, 1 is 4-piece set. Default to 1 */
  bonusLv?: number;
  description: ArtifactModifierDescription;
};

type ArtifactPenaltyCore = EntityPenaltyCore;

type ArtifactPenalty = EntityPenalty<ArtifactPenaltyCore>;

type ArtifactDebuff = EntityDebuff<ArtifactPenalty> & {
  description: ArtifactModifierDescription;
};
