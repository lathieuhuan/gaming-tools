import type { PreciseOmit } from "rond";
import type {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  IArtifactModCtrlBasic,
  IModifierCtrlBasic,
  ITeammateArtifact,
  ITeammateWeapon,
} from "./calculation";
import type { SetupType } from "./calculator";
import type {
  IArtifactBasic,
  ICharacterBasic,
  ITarget,
  ITargetBasic,
  ITeammateArtifactBasic,
  ITeammateWeaponBasic,
  IWeaponBasic,
} from "./entity";

export type IDbWeapon = IWeaponBasic & {
  owner?: string;
  setupIDs?: number[];
};

export type IDbArtifact = IArtifactBasic & {
  owner?: string;
  setupIDs?: number[];
};

export type IDbItem = IDbWeapon | IDbArtifact;

export type IDbTeammateWeapon = ITeammateWeaponBasic & {
  buffCtrls: IModifierCtrlBasic[];
};

export type IDbTeammateArtifact = ITeammateArtifactBasic & {
  buffCtrls: IArtifactModCtrlBasic[];
};

export type IDbTeammate = {
  name: string;
  enhanced: boolean;
  buffCtrls: IModifierCtrlBasic[];
  debuffCtrls: IModifierCtrlBasic[];
  weapon: IDbTeammateWeapon;
  artifact?: IDbTeammateArtifact;
};

export type IDbCharacter = ICharacterBasic & {
  weaponID: number;
  artifactIDs: number[];
};

export type IDbTarget = ITargetBasic & {};

export type IDbSetup = {
  ID: number;
  type: Exclude<SetupType, "complex">;
  name: string;

  char: IDbCharacter;
  selfBuffCtrls: IModifierCtrlBasic[];
  selfDebuffCtrls: IModifierCtrlBasic[];

  wpBuffCtrls: IModifierCtrlBasic[];
  artBuffCtrls: IArtifactModCtrlBasic[];
  artDebuffCtrls: IArtifactModCtrlBasic[];
  teamBuffCtrls: IModifierCtrlBasic[];

  teammates: IDbTeammate[];
  // elmtModCtrls: ElementModCtrl;
  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  // customInfusion: Infusion;
  weaponID: number;
  artifactIDs: number[];
  target: IDbTarget;
};

export type IDbComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};
