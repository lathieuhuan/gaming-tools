import type { PartiallyRequiredOnly } from "rond";

import type { CalcResult } from "@/calculation-new/calculator/types";
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
import type { MainTarget } from "../MainTarget";
import type { MainCharacter } from "../MainCharacter";

export type ICalcSetup<
  TCharacter extends MainCharacter = MainCharacter,
  TTeammate extends ICalcTeammate = ICalcTeammate,
  TTeam extends ICalcTeam = ICalcTeam,
  TTarget extends ITarget = ITarget
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
  target: TTarget;
};

export type CloneOptions = {
  ID?: number;
};

export type CalcSetupConstructParams = PartiallyRequiredOnly<
  ICalcSetup<MainCharacter, CalcTeammate, CalcTeam, MainTarget>,
  "char" | "target"
> & {
  artifactAttrs?: TotalAttributes;
  result?: CalcResult;
};
