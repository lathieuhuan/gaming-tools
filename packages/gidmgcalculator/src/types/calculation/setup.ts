import type { ICharacter, ITarget } from "../entity";
import type { ICalcTeam } from "./calculation-common";
import type {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IArtifactBuffCtrl,
  IArtifactDebuffCtrl,
  ITeamBuffCtrl,
  IWeaponBuffCtrl,
  ResonanceModCtrl,
} from "./modifiers";
import type { ICalcTeammate } from "./teammate";
import type { ICalcCharacter } from "@/models/base/CalcCharacter";

export type ISetup<
  TCharacter extends ICalcCharacter = ICalcCharacter,
  TTeammate extends ICalcTeammate = ICalcTeammate,
  TTeam extends ICalcTeam = ICalcTeam,
  TTarget extends ITarget = ITarget
> = {
  ID: number;
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
