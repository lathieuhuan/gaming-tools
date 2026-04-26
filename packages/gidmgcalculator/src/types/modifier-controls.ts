import type { AppArtifact, ArtifactBuff, ArtifactDebuff } from "./app-artifact";
import type { CharacterBuff, CharacterDebuff } from "./app-character";
import type { AppTeamBuff } from "./app-team-buff";
import type { WeaponBuff } from "./app-weapon";
import type {
  AmplifyingReaction,
  AttackBonusKey,
  AttackPattern,
  AttributeStat,
  ElementType,
  LunarType,
  QuickenReaction,
  ReactionType,
  ResistReductionKey,
} from "./common";

export type ModifierCtrlState = {
  id: number;
  activated: boolean;
  inputs?: number[];
};

export type ModifierCtrl<T> = ModifierCtrlState & {
  data: T;
};

export type AbilityBuffCtrl = ModifierCtrl<CharacterBuff>;

export type AbilityDebuffCtrl = ModifierCtrl<CharacterDebuff>;

export type WeaponBuffCtrl = ModifierCtrl<WeaponBuff>;

export type ArtifactModCtrlState = ModifierCtrlState & {
  /** set code */
  code: number;
};

export type ArtifactModCtrl<T> = ModifierCtrl<T> & {
  /** set code */
  code: number;
  setData: AppArtifact;
};

export type ArtifactBuffCtrl = ArtifactModCtrl<ArtifactBuff>;

export type ArtifactDebuffCtrl = ArtifactModCtrl<ArtifactDebuff>;

export type TeamBuffCtrl = ModifierCtrl<AppTeamBuff>;

export type ResonanceModCtrl = {
  element: ElementType;
  activated: boolean;
  inputs?: number[];
};

export type AttackReaction = AmplifyingReaction | QuickenReaction | null;

export type ElementalEvent = {
  reaction: AttackReaction;
  absorption: ElementType | null;
  absorbReaction: AttackReaction;
  infusion: ElementType | null;
  infuseReaction: AttackReaction;
  superconduct: boolean;
};

export type CustomBuffCtrlCategory = "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus";

export type CustomBuffCtrlType = "all" | AttributeStat | AttackPattern | ReactionType | LunarType;

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
