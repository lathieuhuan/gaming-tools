import type {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  IArtifactModCtrlBasic,
  IModifierCtrlBasic,
  ResonanceModCtrl,
} from "./modifiers";
import type { SetupType } from "./calculator";
import type {
  IArtifactBasic,
  ICharacterBasic,
  ITargetBasic,
  ITeammateArtifactBasic,
  ITeammateWeaponBasic,
  IWeaponBasic,
} from "./entity";

// TODO remove, use IWeaponBasic
export type IDbWeapon = IWeaponBasic;

// TODO remove, use IArtifactBasic
export type IDbArtifact = IArtifactBasic;

export type IDbItem = IDbWeapon | IDbArtifact;

export type IDbTeammateWeapon = ITeammateWeaponBasic & {
  buffCtrls: IModifierCtrlBasic[];
};

export type IDbTeammateArtifact = ITeammateArtifactBasic & {
  buffCtrls: IModifierCtrlBasic[];
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

  main: IDbCharacter;
  selfBuffCtrls: IModifierCtrlBasic[];
  selfDebuffCtrls: IModifierCtrlBasic[];

  wpBuffCtrls: IModifierCtrlBasic[];
  artBuffCtrls: IArtifactModCtrlBasic[];
  artDebuffCtrls: IArtifactModCtrlBasic[];

  teammates: IDbTeammate[];
  teamBuffCtrls: IModifierCtrlBasic[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];

  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  target: IDbTarget;
};

export type IDbComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};
