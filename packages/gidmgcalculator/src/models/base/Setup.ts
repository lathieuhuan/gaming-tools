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
  ICharacter,
  ISetup,
  ITarget,
  ITeamBuffCtrl,
  IWeaponBuffCtrl,
  ResonanceModCtrl,
} from "@/types";

export class Setup<
  TCharacter extends ICharacter = ICharacter,
  TTeammate extends ICalcTeammate = ICalcTeammate,
  TTeam extends ICalcTeam = ICalcTeam,
  TTarget extends ITarget = ITarget
> implements ISetup<TCharacter, TTeammate, TTeam, TTarget>
{
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

  constructor(info: ISetup<TCharacter, TTeammate, TTeam, TTarget>) {
    this.ID = info.ID;
    this.char = info.char;
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
