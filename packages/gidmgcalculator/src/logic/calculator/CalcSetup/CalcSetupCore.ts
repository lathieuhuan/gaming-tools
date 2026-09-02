import type { Character, Target, Teammate } from "@/models";
import type {
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  ArtifactBuffCtrl,
  ArtifactDebuffCtrl,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  ResonanceModCtrl,
  TalentCalcItem,
  TeamBuffCtrl,
  WeaponBuffCtrl,
} from "@/types";
import type { Team } from "../Team";
import type { CalcResult } from "../types";

export class CalcSetupCore {
  calcItems: TalentCalcItem[];

  protected constructor(
    public ID: number,

    public main: Character,
    public teammates: Teammate[],
    public team: Team,
    public target: Target,

    public selfBuffCtrls: AbilityBuffCtrl[],
    public selfDebuffCtrls: AbilityDebuffCtrl[],

    public wpBuffCtrls: WeaponBuffCtrl[],
    public artBuffCtrls: ArtifactBuffCtrl[],
    public artDebuffCtrls: ArtifactDebuffCtrl[],

    public teamBuffCtrls: TeamBuffCtrl[],
    public rsnBuffCtrls: ResonanceModCtrl[],
    public rsnDebuffCtrls: ResonanceModCtrl[],
    public elmtEvent: ElementalEvent,
    public customBuffCtrls: CustomBuffCtrl[],
    public customDebuffCtrls: CustomDebuffCtrl[],

    public result: CalcResult,
  ) {
    this.calcItems = [];
  }
}
