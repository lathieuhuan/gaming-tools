import type {
  AttackElementInfoKey,
  AttackPatternBonusKey,
  AttackPatternInfoKey,
  ReactionBonusInfoKey,
  ResistanceReductionKey,
} from "./calculation.types";
import type {
  Artifact,
  AttackElement,
  AttackReaction,
  AttributeStat,
  Character,
  ElementType,
  NormalAttack,
  Reaction,
  Weapon,
  WeaponType,
} from "./global.types";

export type CalcWeapon = Weapon;

export type CalcArtifact = Artifact;
export type CalcArtifacts = (CalcArtifact | null)[];

export type CalcCharacter = Character;

// MODIFIER CONTROL starts
export type ModifierCtrl = {
  activated: boolean;
  /** This is WeaponBuff.index / ArtifactBuff.index / Modifier_Character.index */
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

export type CustomBuffCtrlType = AttributeStat | AttackPatternBonusKey | Reaction;

export type CustomBuffCtrl = {
  category: "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus";
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

export type SetupType = "original" | "combined" | "complex";

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

export type Target = {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;
};
