import type { CalcResult } from "@/calculation/calculator";
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
} from "@/types";
import type { Character } from "../Character";
import type { Target } from "../Target";
import type { Team } from "../Team";
import type { TeammateCalc } from "../TeammateCalc";

export type CalcSetupBaseConstructInfo = {
  ID: number;
  main: Character;
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

  teammates: TeammateCalc[];
  team: Team;
  target: Target;

  result: CalcResult;
};

export class CalcSetupBase {
  ID: number;
  main: Character;
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

  teammates: TeammateCalc[];
  team: Team;
  target: Target;

  result: CalcResult;

  constructor(info: CalcSetupBaseConstructInfo) {
    this.ID = info.ID;
    this.main = info.main;
    this.selfBuffCtrls = info.selfBuffCtrls;
    this.selfDebuffCtrls = info.selfDebuffCtrls;
    this.wpBuffCtrls = info.wpBuffCtrls;
    this.artBuffCtrls = info.artBuffCtrls;
    this.artDebuffCtrls = info.artDebuffCtrls;
    this.teamBuffCtrls = info.teamBuffCtrls;
    this.rsnBuffCtrls = info.rsnBuffCtrls;
    this.rsnDebuffCtrls = info.rsnDebuffCtrls;
    this.elmtEvent = info.elmtEvent;
    this.customBuffCtrls = info.customBuffCtrls;
    this.customDebuffCtrls = info.customDebuffCtrls;
    this.teammates = info.teammates;
    this.team = info.team;
    this.target = info.target;
    this.result = info.result;
  }
}
