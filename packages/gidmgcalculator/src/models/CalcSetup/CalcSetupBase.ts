import type { CalcResult } from "@/calculation/calculator";
import type {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  ArtifactBuffCtrl,
  ArtifactDebuffCtrl,
  TeamBuffCtrl,
  WeaponBuffCtrl,
  ResonanceModCtrl,
} from "@/types";
import type { Character } from "../Character";
import type { Target } from "../Target";
import type { Team } from "../Team";
import type { Teammate } from "../Teammate";

export type CalcSetupBaseConstructData = {
  ID: number;
  main: Character;
  selfBuffCtrls: AbilityBuffCtrl[];
  selfDebuffCtrls: AbilityDebuffCtrl[];

  wpBuffCtrls: WeaponBuffCtrl[];
  artBuffCtrls: ArtifactBuffCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];

  teamBuffCtrls: TeamBuffCtrl[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];
  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];

  teammates: Teammate[];
  team: Team;
  target: Target;

  result: CalcResult;
};

export class CalcSetupBase {
  ID: number;
  main: Character;
  selfBuffCtrls: AbilityBuffCtrl[];
  selfDebuffCtrls: AbilityDebuffCtrl[];

  wpBuffCtrls: WeaponBuffCtrl[];
  artBuffCtrls: ArtifactBuffCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];

  teamBuffCtrls: TeamBuffCtrl[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];
  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];

  teammates: Teammate[];
  team: Team;
  target: Target;

  result: CalcResult;

  constructor(info: CalcSetupBaseConstructData) {
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
