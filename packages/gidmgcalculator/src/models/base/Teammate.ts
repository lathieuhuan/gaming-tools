import type {
  AppCharacter,
  EffectPerformableCondition,
  EffectPerformerConditions,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  ITeam,
  ITeammate,
  ITeammateArtifact,
  ITeammateInfo,
  ITeammateWeapon,
} from "@/types";

import { isPassedComparison } from "./utils/isPassedComparison";
import { isValidInput } from "./utils/isValidInput";

export class Teammate<TTeam extends ITeam = ITeam> implements ITeammate<TTeam> {
  name: string;
  enhanced: boolean;
  buffCtrls: IAbilityBuffCtrl[];
  debuffCtrls: IAbilityDebuffCtrl[];
  weapon: ITeammateWeapon;
  artifact?: ITeammateArtifact;
  // inputs: TeammateInput[] = [];

  constructor(info: ITeammateInfo, public data: AppCharacter, protected team: TTeam) {
    this.name = info.name;
    this.enhanced = info.enhanced;
    this.buffCtrls = info.buffCtrls;
    this.debuffCtrls = info.debuffCtrls;
    this.weapon = info.weapon;
    this.artifact = info.artifact;
    // this.inputs = info.inputs;
  }

  join(team: TTeam) {
    this.team = team;
  }

  protected canPerformEffect(condition: EffectPerformerConditions, inputs: number[]) {
    const { grantedAt } = condition;

    if (grantedAt && typeof grantedAt !== "string") {
      const { altIndex = undefined, compareValue = 1, comparison = "EQUAL" } = grantedAt;
      return (
        altIndex === undefined ||
        isPassedComparison(inputs[altIndex] ?? 0, compareValue, comparison)
      );
    }

    return true;
  }

  isPerformableEffect(condition?: EffectPerformableCondition, inputs: number[] = []) {
    if (!condition) {
      return true;
    }

    if (!this.team.isAvailableEffect(condition)) {
      return false;
    }
    if (!this.canPerformEffect(condition, inputs)) {
      return false;
    }
    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }
}
