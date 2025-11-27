import type { AppArtifact } from "../app-artifact";
import type { AppWeapon } from "../app-weapon";
import type { ITeammateBasic, ITeamMember, IWeaponBasic } from "../entity";
import type {
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IArtifactBuffCtrl,
  IWeaponBuffCtrl,
} from "./modifiers";

// type TeammateInput = {
//   id: string;
//   value: number;
// };

export type ITeammateWeapon = IWeaponBasic & {
  buffCtrls: IWeaponBuffCtrl[];
  data: AppWeapon;
};

export type ITeammateArtifact = {
  code: number;
  buffCtrls: IArtifactBuffCtrl[];
  // TODO add debuffCtrls
  data: AppArtifact;
};

export type ITeammate = ITeammateBasic & {
  buffCtrls: IAbilityBuffCtrl[];
  debuffCtrls: IAbilityDebuffCtrl[];
  weapon: ITeammateWeapon;
  artifact?: ITeammateArtifact;
  // inputs: TeammateInput[];
};

export type ICalcTeammate = ITeammate & ITeamMember;
