import type {
  AutoRsnElmtType,
  ElementCount,
  ElementType,
  ITeam,
  ITeamMember,
  TalentType,
  TeamConditions,
  TeamElementConditions,
  TeamPropertyCondition,
} from "@/types";

import TypeCounter from "@/utils/TypeCounter";
import { isAutoRsnElmt } from "./utils/isAutoRsnElmt";
import { isPassedComparison } from "./utils/isPassedComparison";

export class Team<TMember extends ITeamMember = ITeamMember> implements ITeam {
  members: TMember[];
  elmtCount: ElementCount;
  resonances: AutoRsnElmtType[];
  extraTalentLv: TypeCounter<TalentType>;
  moonsignLv: number;
  witchRiteLv: number;

  constructor(members: TMember[] = []) {
    const newMembers = this.filterMembers(members);

    newMembers.forEach((member) => member.join(this));

    const { elmtCount, moonsignLv, witchRiteLv, extraTalentLv, resonances } =
      this.parseMembers(newMembers);

    this.members = newMembers;
    this.elmtCount = elmtCount;
    this.moonsignLv = moonsignLv;
    this.witchRiteLv = witchRiteLv;
    this.extraTalentLv = extraTalentLv;
    this.resonances = resonances;
  }

  protected filterMembers(members: TMember[]) {
    const existNames = new Set<string>();
    const newMembers: TMember[] = [];

    for (const member of members) {
      if (member && !existNames.has(member.name)) {
        existNames.add(member.name);
        newMembers.push(member);
      }
    }

    return newMembers.length > 4 ? newMembers.slice(-4) : newMembers;
  }

  protected parseMembers(members: TMember[]) {
    const elmtCount: ElementCount = new TypeCounter();
    let moonsignLv = 0;
    let witchRiteLv = 0;

    for (const member of members) {
      elmtCount.add(member.data.vision);

      if (member.data.faction?.includes("moonsign")) {
        moonsignLv++;
      }

      if (member.enhanced) {
        witchRiteLv++;
      }
    }

    // ===== Extra Talent LV =====

    const extraTalentLv = new TypeCounter<TalentType>();

    const hasMember = (name: string) => {
      return members.some((member) => member.data.name === name);
    };

    if (hasMember("Tartaglia")) {
      extraTalentLv.add("NAs");
    }
    if (hasMember("Skirk")) {
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

    const resonances: AutoRsnElmtType[] = [];

    elmtCount.forEach((elmt, count) => {
      if (isAutoRsnElmt(elmt) && count >= 2) {
        resonances.push(elmt);
      }
    });

    return { elmtCount, moonsignLv, witchRiteLv, extraTalentLv, resonances };
  }

  updateMembers(members: TMember[]) {
    const { elmtCount, moonsignLv, witchRiteLv, extraTalentLv, resonances } =
      this.parseMembers(members);

    this.members = members;
    this.elmtCount = elmtCount;
    this.moonsignLv = moonsignLv;
    this.witchRiteLv = witchRiteLv;
    this.extraTalentLv = extraTalentLv;
    this.resonances = resonances;
  }

  checkTeamElmt(condition: TeamElementConditions) {
    const { elmtCount } = this;
    const { teamOnlyElmts, teamEachElmtCount, teamElmtTotalCount, teamTotalElmtCount } = condition;

    if (
      teamOnlyElmts &&
      elmtCount.keys.some((elementType) => !teamOnlyElmts.includes(elementType))
    ) {
      return false;
    }
    if (teamEachElmtCount) {
      const requiredEntries = new TypeCounter(teamEachElmtCount).entries;

      if (requiredEntries.some(([type, value]) => elmtCount.get(type) < value)) {
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
      } else if (!isPassedComparison(elmtCount.keys.length, value, comparison)) {
        return false;
      }
    }

    return true;
  }

  checkTeamProps(condition: TeamPropertyCondition) {
    let input = 0;

    switch (condition.type) {
      case "MOONSIGN":
        input = this.moonsignLv;
        break;
      case "WITCH_RITE":
        input = this.witchRiteLv;
        break;
    }

    if (!isPassedComparison(input, condition.value, condition.comparison)) {
      return false;
    }

    return true;
  }

  isAvailableEffect(condition: TeamConditions) {
    if (!this.checkTeamElmt(condition)) {
      return false;
    }
    if (condition.checkParty && !this.checkTeamProps(condition.checkParty)) {
      return false;
    }

    return true;
  }

  getMixedCount(performerElmt: ElementType) {
    return this.members.reduce((total, { data }) => {
      const isEligible = data.nation === "natlan" || data.vision !== performerElmt;
      return total + (isEligible ? 1 : 0);
    }, 0);
  }
}
