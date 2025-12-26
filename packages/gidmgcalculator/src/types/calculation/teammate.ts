import type TypeCounter from "@/utils/TypeCounter";
import type { AppArtifact, ArtifactBuff } from "../app-artifact";
import type { AppCharacter } from "../app-character";
import type {
  EffectPerformableCondition,
  TeamConditions,
  TeamElementConditions,
  TeamMilestoneCondition,
} from "../app-entity";
import type { AppWeapon } from "../app-weapon";
import type { AutoRsnElmtType, ElementCount, ElementType, TalentType } from "../common";
import type { ITeammateArtifactBasic, ITeammateBasicCore, ITeammateWeaponBasic } from "../entity";
import type {
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IModifierCtrl,
  IWeaponBuffCtrl,
} from "../modifiers";

// ========== TEAM ==========

export type ITeamMember<TTeam extends ITeam = ITeam> = {
  name: string;
  enhanced: boolean;
  data: AppCharacter;
  join(team: TTeam): void;
  isPerformableEffect(condition?: EffectPerformableCondition, inputs?: number[]): boolean;
};

export type ITeam = {
  members: ITeamMember[];
  elmtCount: ElementCount;
  resonances: AutoRsnElmtType[];
  extraTalentLv: TypeCounter<TalentType>;
  moonsignLv: number;
  witchRiteLv: number;
  checkTeamElmt(condition: TeamElementConditions): boolean;
  checkTeamProps(condition: TeamMilestoneCondition): boolean;
  isAvailableEffect(condition?: TeamConditions): boolean;
  getMixedCount(performerElmt: ElementType): number;
};

// ========== TEAMMATE ==========

export type ITeammateWeapon = ITeammateWeaponBasic & {
  buffCtrls: IWeaponBuffCtrl[];
  data: AppWeapon;
};

export type ITeammateArtifactBuffCtrl = IModifierCtrl<ArtifactBuff>;

export type ITeammateArtifact = ITeammateArtifactBasic & {
  buffCtrls: ITeammateArtifactBuffCtrl[];
  data: AppArtifact;
};

// type TeammateInput = {
//   id: string;
//   value: number;
// };

export type ITeammateInfo = ITeammateBasicCore & {
  buffCtrls: IAbilityBuffCtrl[];
  debuffCtrls: IAbilityDebuffCtrl[];
  weapon: ITeammateWeapon;
  artifact?: ITeammateArtifact;
  // inputs: TeammateInput[];
};

export type ITeammate<TTeam extends ITeam = ITeam> = ITeammateInfo & ITeamMember<TTeam> & {};
