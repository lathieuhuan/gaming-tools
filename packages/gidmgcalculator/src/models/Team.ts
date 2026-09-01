import type {
  AutoRsnElmtType,
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
import { isAutoRsnElmt } from "@/utils/element.utils";
import { isPassedComparison } from "./utils/isPassedComparison";

export class Team<TMember extends TeamMember = TeamMember> {
  members: TMember[] = [];
  resonances: AutoRsnElmtType[] = [];
  moonsignLv: number = 0;
  witchRiteLv: number = 0;
  elmtCount: ElementCount = new CountMap([], { min: 0 });
  extraTalentLv: CountMap<TalentType> = new CountMap();

  constructor(members: TMember[] = []) {
    const newMembers = this.filterMembers(members);

    this.updateMembers(newMembers);
  }

  protected filterMembers(members: TMember[]) {
    const existCodes = new Set<number>();
    const newMembers: TMember[] = [];

    for (const member of members) {
      if (member && !existCodes.has(member.code)) {
        existCodes.add(member.code);
        newMembers.push(member);
      }
    }

    return newMembers.length > 4 ? newMembers.slice(-4) : newMembers;
  }

  updateMembers(members: TMember[]) {
    if (members.length === 0) {
      return;
    }

    const elmtCount: ElementCount = new CountMap([], { min: 0 });
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

    members.forEach((member) => member.joinTeam(this));

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

  checkTeamElmt(condition: TeamElementConditionSpecs) {
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

  checkTeamProps(condition: TeamMilestoneConditionSpec) {
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

  isAvailableEffect(condition?: TeamConditionSpecs) {
    if (!condition) {
      return true;
    }

    if (!this.checkTeamElmt(condition)) {
      return false;
    }
    if (condition.checkTeamMs && !this.checkTeamProps(condition.checkTeamMs)) {
      return false;
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
}
