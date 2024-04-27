import type { WeaponType } from "./common.types";
import type {
  AppBonus,
  AppBonusAttributeStack,
  AppBonusElementStack,
  AppBuff,
  AppDebuff,
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

type ArtifactEffectValueOption = {
  options: number[];
  /** Input's index for options. Default to 0 */
  inpIndex?: number;
};

type InputStack = {
  type: "INPUT";
  /** If number, default to 0 */
  index?: number;
};

export type ArtifactBonusStack = InputStack | AppBonusAttributeStack | AppBonusElementStack;

export type ArtifactBonusCore = AppBonus<ArtifactBonusStack> & {
  forWeapons?: WeaponType[];
  value: number | ArtifactEffectValueOption;
  /** Apply after stacks */
  sufExtra?: number | ArtifactBonusCore;
  max?: number;
};

type ArtifactBonus = WithBonusTargets<ArtifactBonusCore>;

type SetBonus = {
  description?: number[];
  effects?: ArtifactBuff["effects"];
};

export type ArtifactBuff = AppBuff<ArtifactBonus> & {
  description: string | number | number[];
};

type ArtifactPenalty = WithPenaltyTargets<{
  value: number;
}>;

type ArtifactDebuff = AppDebuff<ArtifactPenalty> & {
  description: string | number | number[];
};
