import type { PreciseOmit } from "rond";
import type {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementModCtrl,
  IArtifactModCtrlBasic,
  IModifierCtrlBasic,
  Infusion,
  ITeammateArtifact,
  ITeammateWeapon,
} from "./calculation";
import type { SetupType } from "./calculator";
import type { IArtifact, ICharacterBasic, ITarget, ITeammateBasic, IWeapon } from "./entity";

export type IUserCharacter = ICharacterBasic & {
  weaponID: number;
  artifactIDs: number[];
};

export type IUserWeapon = IWeapon & {
  owner: string | null;
  setupIDs?: number[];
};

export type IUserArtifact = IArtifact & {
  owner?: string;
  setupIDs?: number[];
};

export type IUserItem = IUserWeapon | IUserArtifact;

export type IUserTeammateWeapon = PreciseOmit<ITeammateWeapon, "buffCtrls" | "data"> & {
  buffCtrls: IModifierCtrlBasic[];
};

export type IUserTeammateArtifact = PreciseOmit<ITeammateArtifact, "buffCtrls" | "data"> & {
  buffCtrls: IArtifactModCtrlBasic[];
};

export type IUserTeammate = ITeammateBasic & {
  buffCtrls: IModifierCtrlBasic[];
  debuffCtrls: IModifierCtrlBasic[];
  weapon: IUserTeammateWeapon;
  artifact: IUserTeammateArtifact;
};

export type IUserSetupCalc = {
  char: ICharacterBasic;
  selfBuffCtrls: IModifierCtrlBasic[];
  selfDebuffCtrls: IModifierCtrlBasic[];

  wpBuffCtrls: IModifierCtrlBasic[];
  artBuffCtrls: IArtifactModCtrlBasic[];
  artDebuffCtrls: IArtifactModCtrlBasic[];
  teamBuffCtrls: IModifierCtrlBasic[];

  teammates: IUserTeammate[];
  elmtModCtrls: ElementModCtrl;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  customInfusion: Infusion;
  weaponID: number;
  artifactIDs: number[];
  target: ITarget;
};

export type IUserSetup = IUserSetupCalc & {
  ID: number;
  type: Exclude<SetupType, "complex">;
  name: string;
};

export type IUserComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};
