import type { PartiallyRequiredOnly } from "rond";

import type { CalcResult } from "@/calculation-new/calculator/types";
import type { CalcCharacter } from "@/models/base";
import type {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IArtifactBuffCtrl,
  IArtifactDebuffCtrl,
  ICalcTeam,
  ICalcTeammate,
  ITarget,
  ITeamBuffCtrl,
  IWeaponBuffCtrl,
  ResonanceModCtrl,
  TotalAttributes,
} from "@/types";
import type { CalcTeam } from "../CalcTeam";
import type { CalcTeammate } from "../CalcTeammate";
import type { MainCharacter } from "../MainCharacter";
import type { MainTarget } from "../MainTarget";

export type ICalcSetup<
  TCharacter extends CalcCharacter = CalcCharacter,
  TTeammate extends ICalcTeammate = ICalcTeammate,
  TTeam extends ICalcTeam = ICalcTeam
> = {
  ID?: number;
  char: TCharacter;
  selfBuffCtrls: IAbilityBuffCtrl[];
  selfDebuffCtrls: IAbilityDebuffCtrl[];

  wpBuffCtrls: IWeaponBuffCtrl[];
  artBuffCtrls: IArtifactBuffCtrl[];
  artDebuffCtrls: IArtifactDebuffCtrl[];
  teamBuffCtrls: ITeamBuffCtrl[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];

  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];

  teammates: TTeammate[];
  team: TTeam;
  target: ITarget;
};

export type UpdateData = Partial<ICalcSetup<MainCharacter, CalcTeammate, CalcTeam>> & {
  artifactAttrs?: TotalAttributes;
  result?: CalcResult;
};

export type CloneOptions = {
  ID?: number;
};

export type CalcSetupConstructParams = PartiallyRequiredOnly<
  ICalcSetup<MainCharacter, CalcTeammate, CalcTeam>,
  "char"
> & {
  target: MainTarget;
  artifactAttrs?: TotalAttributes;
  result?: CalcResult;
};
