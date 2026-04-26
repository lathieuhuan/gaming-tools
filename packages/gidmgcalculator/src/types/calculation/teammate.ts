import type { Team } from "@/models";
import type { AppArtifact, ArtifactBuff } from "../app-artifact";
import type { AppCharacter } from "../app-character";
import type { AppWeapon } from "../app-weapon";
import type { TeammateArtifactState, TeammateStateData, TeammateWeaponState } from "../entity";
import type {
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  ModifierCtrl,
  WeaponBuffCtrl,
} from "../modifier-controls";
import type {
  BonusCoreSpec,
  EffectPerformableConditionSpecs,
  PenaltyCoreSpec,
} from "../modifier-specs";
import type { BareBonus, BonusPerformTools } from "./bonus";

// ========== TEAM ==========

export type TeamMember = {
  code: number;
  enhanced: boolean;
  data: AppCharacter;
  joinTeam(team: Team): void;
  canPerformEffect(condition?: EffectPerformableConditionSpecs, inputs?: number[]): boolean;
  performBonus(config: BonusCoreSpec, tools: Partial<BonusPerformTools>): BareBonus;
  performPenalty(config: PenaltyCoreSpec, inputs?: number[]): number;
};

// ========== TEAMMATE ==========

export type TeammateWeapon = TeammateWeaponState & {
  buffCtrls: WeaponBuffCtrl[];
  data: AppWeapon;
};

export type TeammateArtifactBuffCtrl = ModifierCtrl<ArtifactBuff>;

export type TeammateArtifact = TeammateArtifactState & {
  buffCtrls: TeammateArtifactBuffCtrl[];
  data: AppArtifact;
};

export type TeammateData = TeammateStateData & {
  buffCtrls: AbilityBuffCtrl[];
  debuffCtrls: AbilityDebuffCtrl[];
  weapon: TeammateWeapon;
  artifact?: TeammateArtifact;
};
