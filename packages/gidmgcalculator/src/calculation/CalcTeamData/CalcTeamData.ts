import type { EffectCondition, TalentType } from "@/calculation/types";
import type { AppCharactersByName, Character, Teammates } from "@/types";

import {
  isAvailableEffect,
  isValidCharProps,
  isValidInput,
  isValidPartyProps,
  isValidTeamElmt,
} from "@/calculation/condition-checking";
import Array_ from "@/utils/Array";
import { TeamData } from "./TeamData";

export class CalcTeamData extends TeamData {
  protected _activeMember: Character;
  protected _teammates: Teammates;
  witchRiteLv = 0;

  get activeMember() {
    return this._activeMember;
  }

  get teammates() {
    return this._teammates;
  }

  constructor(activeMember: Character, teammates: Teammates, public data: AppCharactersByName) {
    const trueTeammates = Array_.truthify(teammates);

    super(
      activeMember.name,
      trueTeammates.map((teammate) => teammate.name),
      data
    );
    this._activeMember = activeMember;
    this._teammates = teammates;

    const witchRiteLv = trueTeammates.reduce(
      (total, teammate) => total + (teammate.enhanced ? 1 : 0),
      activeMember.enhanced ? 1 : 0
    );

    this.witchRiteLv = Math.min(witchRiteLv, 2);
  }

  isApplicableEffect(
    condition: EffectCondition,
    inputs: number[],
    fromSelf = false
  ): boolean {
    if (!isAvailableEffect(condition.grantedAt, this._activeMember, inputs, fromSelf)) {
      return false;
    }
    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }
    if (
      !isValidPartyProps(
        condition.checkParty,
        this.activeAppMember,
        this.appTeammates,
        this.moonsignLv,
        this.witchRiteLv
      )
    ) {
      return false;
    }
    // TOCHECK: this does not work when condition is from teammate and the active member is not enhanced
    if (!isValidCharProps(condition, this.activeAppMember, this._activeMember.enhanced)) {
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
