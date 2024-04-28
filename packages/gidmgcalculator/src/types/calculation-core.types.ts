import type {
  AppCharacter,
  AttackElementInfoKey,
  AttackPatternBonusKey,
  AttackPatternInfoKey,
  AttributeStat,
  ElementType,
  ReactionBonusInfoKey,
  ResistanceReductionKey,
  WeaponType,
  AttackElement,
  NormalAttack,
  ReactionType,
} from "@Backend";
import type { AttackReaction } from "./global.types";

type TeammateData = Pick<AppCharacter, "code" | "name" | "icon" | "nation" | "vision" | "weaponType" | "EBcost">;

export type PartyData = (TeammateData | null)[];

export type Target = {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;
};

// MODIFIER CONTROL starts
export type ModifierCtrl = {
  activated: boolean;
  /** This is WeaponBuff.index / ArtifactBuff.index / CharacterModifier.index */
  index: number;
  inputs?: number[];
};

export type ArtifactDebuffCtrl = ModifierCtrl & {
  code: number;
};

export type Resonance = {
  vision: ElementType;
  activated: boolean;
  inputs?: number[];
};
export type ElementModCtrl = {
  infuse_reaction: AttackReaction;
  reaction: AttackReaction;
  absorption: ElementType | null;
  superconduct: boolean;
  resonances: Resonance[];
};

export type CustomBuffCtrlCategory = "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus";

export type CustomBuffCtrlType = AttributeStat | AttackPatternBonusKey | ReactionType;

export type CustomBuffCtrl = {
  category: CustomBuffCtrlCategory;
  type: CustomBuffCtrlType;
  subType?: AttackPatternInfoKey | AttackElementInfoKey | ReactionBonusInfoKey;
  value: number;
};

export type CustomDebuffCtrlType = ResistanceReductionKey;

export type CustomDebuffCtrl = {
  type: CustomDebuffCtrlType;
  value: number;
};
// MODIFIER CONTROL ends

export type Infusion = {
  element: AttackElement;
  range?: NormalAttack[];
};

// PARTY starts
export type TeammateWeapon = {
  code: number;
  type: WeaponType;
  refi: number;
  buffCtrls: ModifierCtrl[];
};

export type TeammateArtifact = {
  code: number;
  buffCtrls: ModifierCtrl[];
};

export type Teammate = {
  name: string;
  buffCtrls: ModifierCtrl[];
  debuffCtrls: ModifierCtrl[];
  weapon: TeammateWeapon;
  artifact: TeammateArtifact;
};

export type Party = (Teammate | null)[];
// PARTY ends
