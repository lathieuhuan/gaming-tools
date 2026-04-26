import { Object_ } from "ron-utils";

import type {
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  AppCharacter,
  BareBonus,
  BonusCoreSpec,
  BonusPerformTools,
  EffectPerformableConditionSpecs,
  PenaltyCoreSpec,
  TeammateArtifact,
  TeammateData,
  TeammateWeapon,
  TeamMember,
  WeaponBuffCtrl,
} from "@/types";
import type { EffectToParseDesc } from "../AbstractEffectValueCalc";
import type { Clonable } from "../interfaces";

import { createAbilityBuffCtrls, createAbilityDebuffCtrls } from "@/logic/modifier.logic";
import { Team } from "../Team";
import { isPassedComparison } from "../utils/isPassedComparison";
import { isValidInput } from "../utils/isValidInput";
import { BonusCalc } from "./BonusCalc";
import { PenaltyCalc } from "./PenaltyCalc";

export type TeammateConstructOptions = {
  enhanced?: boolean;
  buffCtrls?: AbilityBuffCtrl[];
  debuffCtrls?: AbilityDebuffCtrl[];
  artifact?: TeammateArtifact;
  team?: Team;
};

type CloneOptions = {
  team?: Team;
};

export class Teammate implements TeammateData, TeamMember, Clonable<Teammate> {
  code: number;
  enhanced: boolean;
  buffCtrls: AbilityBuffCtrl[];
  debuffCtrls: AbilityDebuffCtrl[];
  weapon: TeammateWeapon;
  artifact?: TeammateArtifact;

  team: Team;

  static #DEFAULT_ENHANCED = false;

  static configure(config: { defaultEnhanced?: boolean }) {
    this.#DEFAULT_ENHANCED = config.defaultEnhanced ?? this.#DEFAULT_ENHANCED;
  }

  constructor(
    code: number,
    public data: AppCharacter,
    weapon: TeammateWeapon,
    options: TeammateConstructOptions = {}
  ) {
    const {
      enhanced = Teammate.#DEFAULT_ENHANCED,
      buffCtrls = createAbilityBuffCtrls(data, false),
      debuffCtrls = createAbilityDebuffCtrls(data, false),
      artifact,
      team = new Team(),
    } = options;

    this.code = code;
    this.enhanced = enhanced;
    this.buffCtrls = buffCtrls;
    this.debuffCtrls = debuffCtrls;
    this.weapon = weapon;
    this.artifact = artifact;
    this.team = team;
  }

  joinTeam(team: Team) {
    this.team = team;
  }

  // ===== SETTERS =====

  update(data: Partial<TeammateData>) {
    const { weapon = this.weapon } = data;

    return new Teammate(this.code, this.data, weapon, { ...this, ...data });
  }

  updateWeaponBuffCtrl(newCtrl: WeaponBuffCtrl) {
    return this.weapon.buffCtrls.map((ctrl) => (ctrl.id === newCtrl.id ? newCtrl : ctrl));
  }

  // ===== CALCULATION =====

  canPerformEffect(condition?: EffectPerformableConditionSpecs, inputs: number[] = []) {
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

  performBonus(
    config: BonusCoreSpec,
    { inputs = [], refi = 0, basedOnFixed = false }: Partial<BonusPerformTools>
  ): BareBonus {
    return new BonusCalc(this, this.team, { inputs, refi, basedOnFixed }).makeBonus(config);
  }

  performPenalty(config: PenaltyCoreSpec, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).makePenalty(config);
  }

  clone(options: CloneOptions = {}) {
    const { team = this.team } = options;

    return new Teammate(this.code, this.data, this.weapon, {
      ...this,
      buffCtrls: Object_.clone(this.buffCtrls),
      debuffCtrls: Object_.clone(this.debuffCtrls),
      weapon: Object_.clone(this.weapon),
      artifact: Object_.clone(this.artifact),
      team,
    });
  }

  // ===== DESCRIPTION =====

  parseBuffDesc(spec: EffectToParseDesc, inputs?: number[]) {
    return new BonusCalc(this, this.team, { inputs }).parseAbilityDesc(spec);
  }

  parseDebuffDesc(spec: EffectToParseDesc, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).parseAbilityDesc(spec);
  }
}
