import type { Member } from "@/models/Member";
import type {
  AutoRsnElmtType,
  ElementCount,
  TeamConditionSpecs,
  TeamElementConditionSpecs,
  TeamMilestoneConditionSpec,
} from "@/types";

import { PHEC_ELEMENT_TYPES } from "@/constants";
import { isAutoRsnElmt } from "@/logic/element.logic";
import { isPassedComparison } from "@/models/utils/isPassedComparison";
import TypeCounter from "@/utils/TypeCounter";

export class TeamState {
  resonances: AutoRsnElmtType[] = [];
  moonsignLv: number = 0;
  witchRiteLv: number = 0;
  elmtCount: ElementCount = new TypeCounter();

  constructor(members: Map<number, Member>) {
    const elmtCount: ElementCount = new TypeCounter();
    let moonsignLv = 0;
    let witchRiteLv = 0;

    for (const member of members.values()) {
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

    this.elmtCount = elmtCount;
    this.moonsignLv = Math.min(moonsignLv, 2);
    this.witchRiteLv = Math.min(witchRiteLv, 2);

    // ===== Resonances =====

    const resonances: AutoRsnElmtType[] = [];

    elmtCount.forEach((elmt, count) => {
      if (isAutoRsnElmt(elmt) && count >= 2) {
        resonances.push(elmt);
      }
    });

    this.resonances = resonances;
  }

  isTeamElmtValid(condition: TeamElementConditionSpecs) {
    const { elmtCount } = this;
    const { teamOnlyElmts, teamEachElmtCount, teamElmtTotalCount, teamTotalElmtCount, varkaPHEC } =
      condition;

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

  isTeamMilestoneValid(condition?: TeamMilestoneConditionSpec) {
    if (!condition) {
      return true;
    }

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

    if (!this.isTeamElmtValid(condition)) {
      return false;
    }
    if (!this.isTeamMilestoneValid(condition.checkTeamMs)) {
      return false;
    }

    return true;
  }
}
