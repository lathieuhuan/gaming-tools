import type {
  AppCharacter,
  EffectPerformableCondition,
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
  code: number;
  enhanced: boolean;
  buffCtrls: IAbilityBuffCtrl[];
  debuffCtrls: IAbilityDebuffCtrl[];
  weapon: ITeammateWeapon;
  artifact?: ITeammateArtifact;
  // inputs: TeammateInput[] = [];

  constructor(info: ITeammateInfo, public data: AppCharacter, protected team: TTeam) {
    this.code = info.code;
    this.enhanced = info.enhanced;
    this.buffCtrls = info.buffCtrls;
    this.debuffCtrls = info.debuffCtrls;
    this.weapon = info.weapon;
    this.artifact = info.artifact;
    // this.inputs = info.inputs;
  }

  joinTeam(team: TTeam) {
    this.team = team;
  }

  canPerformEffect(condition?: EffectPerformableCondition, inputs: number[] = []) {
    if (!condition) {
      return true;
    }

    const { grantedAt } = condition;

    if (grantedAt && typeof grantedAt !== "string") {
      const { altIndex = undefined, compareValue = 1, comparison = "EQUAL" } = grantedAt;
      const granted =
        altIndex === undefined ||
        isPassedComparison(inputs[altIndex] ?? 0, compareValue, comparison);

      if (!granted) {
        return false;
      }
    }

    if (condition.beEnhanced && !this.enhanced) {
      return false;
    }

    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }
}
