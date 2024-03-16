import type { AttributeStat, ModifierAffectType, ModInputConfig, WeaponType } from "./global.types";
import type { AttackPatternPath, ReactionBonusPath, ResistanceReductionKey } from "./calculation-core.types";

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

type SetBonus = {
  description?: number[];
  effects?: ArtifactBonus | ArtifactBonus[];
};

type InputStack = {
  type: "input";
  /** If number, default to 0 */
  index?: number;
};

type AttributeStack = {
  type: "attribute";
  field: "base_atk" | "hp" | "atk" | "def" | "em" | "er_";
};

type VisionStack = {
  type: "vision";
  element: "same_excluded" | "different";
};

type ArtifactEffectValueOption = {
  options: number[];
  /** Input's index for options. Default to 0 */
  inpIndex?: number;
};

export type ArtifactBonus = {
  forWeapons?: WeaponType[];
  /** For this buff to available, the input at index 0 must equal to checkInput */
  checkInput?: number;
  value: number | ArtifactEffectValueOption;
  stacks?: InputStack | AttributeStack | VisionStack;
  /** Apply after stacks */
  sufExtra?: number | Omit<ArtifactBonus, "targets">;
  targets: {
    /** totalAttr */
    ATTR?: AttributeStat | AttributeStat[];
    /** Input's index to get element's index. */
    INP_ELMT?: number;
    /** attPattBonus */
    PATT?: AttackPatternPath | AttackPatternPath[];
    /** rxnBonus */
    RXN?: ReactionBonusPath | ReactionBonusPath[];
  };
  max?: number;
};

export type ArtifactModifier = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputConfig[];
  description: string | number | number[];
};

type ArtifactBuff = ArtifactModifier & {
  /** id to track stackable. Effects under the same buff id and have the same targets cannot be stacked */
  trackId?: string;
  affect: ModifierAffectType;
  effects: ArtifactBonus | ArtifactBonus[];
};

type ArtifactPenalty = {
  value: number;
  path: "inp_elmt" | ResistanceReductionKey;
  /** Only when path = "inp_elmt". Default to 0 */
  inpIndex?: number;
};

type ArtifactDebuff = ArtifactModifier & {
  effects: ArtifactPenalty;
};
