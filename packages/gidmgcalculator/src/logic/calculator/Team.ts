import type {
  AutoRsnElmtType,
  BonusPerformTools,
  EffectPerformableConditionSpecs,
  ElementCount,
  ElementType,
  TalentType,
  TeamConditionSpecs,
  TeamElementConditionSpecs,
  TeamMember,
  TeamMilestoneConditionSpec,
} from "@/types";
import { CountMap, Object_ } from "ron-utils";

import { PHEC_ELEMENT_TYPES } from "@/constants";
import { Character } from "@/models";
import { isPassedComparison } from "@/utils/effect.utils";
import { isAutoRsnElmt } from "@/utils/element.utils";
import {
  AbstractBonusCalc,
  AbstractPenaltyCalc,
  AllyBonusCalc,
  AllyPenaltyCalc,
  BonusCalc,
  PenaltyCalc,
} from "./effects";

export class Team<TMember extends TeamMember = TeamMember> {
  members: TMember[] = [];
  resonances: AutoRsnElmtType[] = [];
  moonsignLv: number = 0;
  witchRiteLv: number = 0;
  elmtCount: ElementCount = new CountMap([], { min: 0 });
  // TODO check if reasonable
  extraTalentLv: CountMap<TalentType> = new CountMap();

  constructor(members: TMember[] = []) {
    this.updateMembers(this.filterMembers(members));
  }

  private filterMembers(members: TMember[]) {
    const newMembers: TMember[] = [];

    for (const member of members) {
      if (newMembers.every((m) => m.code !== member.code)) {
        newMembers.push(member);
      }
    }

    return newMembers.slice(-4);
  }

  updateMembers(members: TMember[]) {
    if (members.length === 0) {
      return;
    }

    const elmtCount: ElementCount = new CountMap();
    let moonsignLv = 0;
    let witchRiteLv = 0;

    for (const member of members) {
      const { data } = member;

      elmtCount.add(data.vision);

      if (data.faction?.includes("moonsign")) {
        moonsignLv++;
      }

      if (member.enhanced) {
        if (data.enhanceType === "HEXEREI") {
          witchRiteLv++;
        }

        // More future enhance types
      }
    }

    this.members = members;
    this.elmtCount = elmtCount;
    this.moonsignLv = Math.min(moonsignLv, 2);
    this.witchRiteLv = Math.min(witchRiteLv, 2);

    // ===== Resonances =====

    const resonances: AutoRsnElmtType[] = [];

    elmtCount.forEach((count, elmt) => {
      if (isAutoRsnElmt(elmt) && count >= 2) {
        resonances.push(elmt);
      }
    });

    this.resonances = resonances;

    // ===== Extra Talent LV =====

    const extraTalentLv = new CountMap<TalentType>();

    if (this.getMember("Tartaglia")) {
      extraTalentLv.add("NAs");
    }
    if (this.getMember("Skirk")) {
      const isValid = this.checkTeamElmt({
        teamOnlyElmts: ["hydro", "cryo"],
        teamEachElmtCount: {
          hydro: 1,
          cryo: 1,
        },
      });

      if (isValid) {
        extraTalentLv.add("ES");
      }
    }

    this.extraTalentLv = extraTalentLv;
  }

  getMember(name: string) {
    return this.members.find((member) => member.data.name === name);
  }

  private checkTeamElmt(condition: TeamElementConditionSpecs) {
    const { elmtCount } = this;
    const { teamOnlyElmts, teamEachElmtCount, teamElmtTotalCount, teamTotalElmtCount, varkaPHEC } =
      condition;

    if (
      teamOnlyElmts &&
      Array.from(elmtCount.keys()).some((elementType) => !teamOnlyElmts.includes(elementType))
    ) {
      return false;
    }

    if (teamEachElmtCount) {
      const lackRequiredElmt = Object_.entries(teamEachElmtCount).some(
        ([type, value]) => value !== undefined && elmtCount.get(type) < value,
      );

      if (lackRequiredElmt) {
        return false;
      }
    }

    if (teamElmtTotalCount) {
      const { elements, value, comparison } = teamElmtTotalCount;

      if (!isPassedComparison(elmtCount.get(elements), value, comparison)) {
        return false;
      }
    }

    if (teamTotalElmtCount) {
      const { elements, value, comparison } = teamTotalElmtCount;

      if (elements) {
        if (!isPassedComparison(elmtCount.get(elements), value, comparison)) {
          return false;
        }
      } else if (!isPassedComparison(elmtCount.size, value, comparison)) {
        return false;
      }
    }

    if (varkaPHEC) {
      const hasAny2SamePHEC = PHEC_ELEMENT_TYPES.some((elmt) => elmtCount.get(elmt) >= 2);

      if (varkaPHEC === "AND" && (elmtCount.get("anemo") < 2 || !hasAny2SamePHEC)) {
        return false;
      }
      if (varkaPHEC === "OR" && elmtCount.get("anemo") < 2 && !hasAny2SamePHEC) {
        return false;
      }
    }

    return true;
  }

  private checkTeamProps(condition: TeamMilestoneConditionSpec) {
    let input = 0;
    const {
      type,
      value = 2,
      comparison = "EQUAL",
    } = typeof condition === "object" ? condition : { type: condition };

    switch (type) {
      case "MOONSIGN":
        input = this.moonsignLv;
        break;
      case "WITCH_RITE":
        input = this.witchRiteLv;
        break;
    }

    if (!isPassedComparison(input, value, comparison)) {
      return false;
    }

    return true;
  }

  private isAvailableEffect(condition?: TeamConditionSpecs, performer?: TeamMember) {
    if (!condition) {
      return true;
    }

    if (!this.checkTeamElmt(condition)) {
      return false;
    }

    if (condition.checkTeamMs && !this.checkTeamProps(condition.checkTeamMs)) {
      return false;
    }

    if (condition.checkMixed && performer) {
      const mixedCount = this.getMixedCount(performer.data.vision);

      if (!isPassedComparison(mixedCount, 3, "MIN")) {
        return false;
      }
    }

    return true;
  }

  getPhecElmt() {
    let index = 0;

    while (index < PHEC_ELEMENT_TYPES.length) {
      const elmt = PHEC_ELEMENT_TYPES[index];
      index++;

      if (this.elmtCount.has(elmt)) {
        return elmt;
      }
    }

    return undefined;
  }

  getMixedCount(performerElmt: ElementType) {
    return this.members.reduce((total, { data }) => {
      const isEligible = data.nation === "natlan" || data.vision !== performerElmt;
      return total + (isEligible ? 1 : 0);
    }, 0);
  }

  member(member: TeamMember): MemberOps {
    return {
      canPerformEffect: (condition, inputs) => {
        return (
          this.isAvailableEffect(condition, member) && member.canPerformEffect(condition, inputs)
        );
      },
      bonusCalc: (tools) => {
        return member instanceof Character
          ? new BonusCalc(member, this, tools)
          : new AllyBonusCalc(member, this, tools);
      },
      penaltyCalc: (inputs) => {
        return member instanceof Character
          ? new PenaltyCalc(member, this, inputs)
          : new AllyPenaltyCalc(member, this, inputs);
      },
    };
  }
}

export type MemberOps = {
  canPerformEffect(condition?: EffectPerformableConditionSpecs, inputs?: number[]): boolean;
  bonusCalc(tools?: Partial<BonusPerformTools>): AbstractBonusCalc;
  penaltyCalc(inputs?: number[]): AbstractPenaltyCalc;
};
