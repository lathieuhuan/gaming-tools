import type { CalcResult } from "@/calculation-new/calculator/types";
import type { CalcCharacter, Target, Team } from "@/models/base";
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
import type { CalcTeammate } from "../CalcTeammate";

export type CalcSetupBaseConstructInfo = {
  ID: number;
  main: CalcCharacter;
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

  teammates: CalcTeammate[];
  team: Team;
  target: Target;
};

export class CalcSetupBase {
  ID: number;
  main: CalcCharacter;
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

  teammates: CalcTeammate[];
  team: Team;
  target: Target;

  result: CalcResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN: {},
    WP: {},
  };

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
  }
}
