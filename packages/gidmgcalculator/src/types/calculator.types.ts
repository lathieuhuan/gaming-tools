import type {
  AppCharacter,
  AttackElement,
  AttackBonusKey,
  AttributeStat,
  ElementType,
  NormalAttack,
  ReactionType,
  ResistanceReductionKey,
  WeaponType,
  AttackPattern,
} from "@Backend";
import type { Artifact, AttackReaction, Character, Weapon } from "./global.types";

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

export type CustomBuffCtrlType = AttributeStat | "all" | AttackPattern | ReactionType;

export type CustomBuffCtrl = {
  category: CustomBuffCtrlCategory;
  type: CustomBuffCtrlType;
  subType?: AttackBonusKey;
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
export type TeammateWeapon = Pick<Weapon, "code" | "type" | "refi"> & {
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

export type CalcWeapon = Weapon;

export type CalcArtifact = Artifact;
export type CalcArtifacts = (CalcArtifact | null)[];

export type CalcCharacter = Character;

export type SetupType = "original" | "combined" | "complex";

export type CalcSetupManageInfo = {
  ID: number;
  type: SetupType;
  name: string;
};

export type CalcSetup = {
  char: CalcCharacter;
  selfBuffCtrls: ModifierCtrl[];
  selfDebuffCtrls: ModifierCtrl[];

  weapon: CalcWeapon;
  wpBuffCtrls: ModifierCtrl[];
  artifacts: CalcArtifacts;
  artBuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];

  party: Party;
  elmtModCtrls: ElementModCtrl;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  customInfusion: Infusion;
};

export type SetupImportInfo = {
  importRoute?: "URL" | "SETUP_MANAGER";
  ID?: number;
  name?: string;
  type?: "original" | "combined";
  calcSetup?: CalcSetup;
  target?: Target;
};
