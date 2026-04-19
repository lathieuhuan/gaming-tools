import type { Team } from "@/models";
import type { AppArtifact, ArtifactBuff } from "../app-artifact";
import type { AppCharacter } from "../app-character";
import type {
  EffectPerformableCondition
} from "../modifier-specs";
import type { AppWeapon } from "../app-weapon";
import type { TeammateArtifactState, TeammateStateData, TeammateWeaponState } from "../entity";
import type {
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IModifierCtrl,
  IWeaponBuffCtrl,
} from "../modifiers";

// ========== TEAM ==========

export type TeamMember = {
  code: number;
  enhanced: boolean;
  data: AppCharacter;
  joinTeam(team: Team): void;
  canPerformEffect(condition?: EffectPerformableCondition, inputs?: number[]): boolean;
};

// ========== TEAMMATE ==========

export type TeammateWeapon = TeammateWeaponState & {
  buffCtrls: IWeaponBuffCtrl[];
  data: AppWeapon;
};

export type TeammateArtifactBuffCtrl = IModifierCtrl<ArtifactBuff>;

export type TeammateArtifact = TeammateArtifactState & {
  buffCtrls: TeammateArtifactBuffCtrl[];
  data: AppArtifact;
};

export type ITeammateInfo = TeammateStateData & {
  buffCtrls: IAbilityBuffCtrl[];
  debuffCtrls: IAbilityDebuffCtrl[];
  weapon: TeammateWeapon;
  artifact?: TeammateArtifact;
};
