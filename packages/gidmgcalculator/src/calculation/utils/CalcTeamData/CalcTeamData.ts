import type { EffectApplicableCondition, TalentType } from "@Src/calculation/types";
import type { AppCharactersByName, Character, Teammates } from "@Src/types";

import Array_ from "@Src/utils/array-utils";
import {
  isAvailableEffect,
  isValidCharProps,
  isValidInput,
  isValidPartyProps,
  isValidTeamElmt,
} from "../condition-checking";
import { TeamData } from "./TeamData";

export class CalcTeamData extends TeamData {
  protected _activeMember: Character;
  protected _teammates: Teammates;

  get activeMember() {
    return this._activeMember;
  }

  get teammates() {
    return this._teammates;
  }

  constructor(activeMember: Character, teammates: Teammates, public data: AppCharactersByName) {
    super(
      activeMember.name,
      Array_.truthy(teammates).map((teammate) => teammate.name),
      data
    );
    this._activeMember = activeMember;
    this._teammates = teammates;
  }

  isApplicableEffect(condition: EffectApplicableCondition, inputs: number[], fromSelf = false): boolean {
    if (!isAvailableEffect(condition.grantedAt, this._activeMember, inputs, fromSelf)) {
      return false;
    }
    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }
    if (!isValidPartyProps(condition.checkParty, this.activeAppMember, this.appTeammates, this.moonsignLv)) {
      return false;
    }
    if (!isValidCharProps(condition, this.activeAppMember)) {
      return false;
    }
    if (!isValidTeamElmt(this.elmtCount, condition)) {
      return false;
    }

    return true;
  }

  getTotalXtraTalentLv = (talentType: TalentType, member?: Character): number => {
    let _activeMember = this._activeMember;
    let _activeAppMember = this.activeAppMember;

    if (member && member.name !== _activeMember.name) {
      _activeMember = member;
      _activeAppMember = this.getAppMember(member.name);
    }

    let result = this.extraTalentLv.get(talentType);

    if (talentType !== "altSprint") {
      const consLv = _activeAppMember.talentLvBonus?.[talentType];

      if (consLv && _activeMember.cons >= consLv) {
        result += 3;
      }
    }
    return result;
  };

  getFinalTalentLv = (talentType: TalentType, member = this._activeMember): number => {
    const talentLv = talentType === "altSprint" ? 0 : member[talentType];
    return talentLv + this.getTotalXtraTalentLv(talentType, member);
  };
}
