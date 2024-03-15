import type { Artifact, Character, Weapon } from "./global.types";
import type {
  ArtifactDebuffCtrl,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementModCtrl,
  Infusion,
  ModifierCtrl,
  Party,
  Target,
} from "./calculation.types";

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
