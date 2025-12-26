import type { AppArtifact, ArtifactBuff, ArtifactDebuff } from "./app-artifact";
import type { CharacterBuff, CharacterDebuff } from "./app-character";
import type { AppTeamBuff } from "./app-team-buff";
import type { WeaponBuff } from "./app-weapon";
import type {
  AttackBonusKey,
  AttackPattern,
  AttributeStat,
  ElementType,
  LunarType,
  ReactionType,
  ResistReductionKey,
} from "./common";
import type { AttackReaction } from "./calculation/calculation-common";

export type IModifierCtrlBasic = {
  id: number;
  activated: boolean;
  inputs?: number[];
};

export type IModifierCtrl<T> = IModifierCtrlBasic & {
  data: T;
};

export type IAbilityBuffCtrl = IModifierCtrl<CharacterBuff>;

export type IAbilityDebuffCtrl = IModifierCtrl<CharacterDebuff>;

export type IWeaponBuffCtrl = IModifierCtrl<WeaponBuff>;

export type IArtifactModCtrlBasic = IModifierCtrlBasic & {
  /** set code */
  code: number;
};

export type IArtifactModCtrl<T> = IModifierCtrl<T> & {
  /** set code */
  code: number;
  setData: AppArtifact;
};

export type IArtifactBuffCtrl = IArtifactModCtrl<ArtifactBuff>;

export type IArtifactDebuffCtrl = IArtifactModCtrl<ArtifactDebuff>;

export type ITeamBuffCtrl = IModifierCtrl<AppTeamBuff>;

export type ResonanceModCtrl = {
  element: ElementType;
  activated: boolean;
  inputs?: number[];
};

export type ElementalEvent = {
  reaction: AttackReaction;
  absorption: ElementType | null;
  absorbReaction: AttackReaction;
  infusion: ElementType | null;
  infuseReaction: AttackReaction;
  superconduct: boolean;
};

export type CustomBuffCtrlCategory = "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus";

export type CustomBuffCtrlType = AttributeStat | "all" | AttackPattern | ReactionType | LunarType;

export type CustomBuffCtrl = {
  category: CustomBuffCtrlCategory;
  type: CustomBuffCtrlType;
  subType?: AttackBonusKey;
  value: number;
};

export type CustomDebuffCtrlType = ResistReductionKey;

export type CustomDebuffCtrl = {
  type: CustomDebuffCtrlType;
  value: number;
};
