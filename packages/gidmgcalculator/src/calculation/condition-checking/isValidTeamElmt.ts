import type { ElementCount, TeamElementCondition } from "@/calculation/types";

import TypeCounter from "@/utils/TypeCounter";
import { isPassedComparison } from "./isPassedComparison";

export function isValidTeamElmt(allElmtCount: ElementCount, condition: TeamElementCondition) {
  const { teamOnlyElmts, teamEachElmtCount, teamElmtTotalCount, teamTotalElmtCount } = condition;

  if (teamOnlyElmts && allElmtCount.keys.some((elementType) => !teamOnlyElmts.includes(elementType))) {
    return false;
  }
  if (teamEachElmtCount) {
    const requiredEntries = new TypeCounter(teamEachElmtCount).entries;

    if (requiredEntries.some(([type, value]) => allElmtCount.get(type) < value)) {
      return false;
    }
  }
  if (teamElmtTotalCount) {
    const { elements, value, comparison } = teamElmtTotalCount;

    if (!isPassedComparison(allElmtCount.get(elements), value, comparison)) {
      return false;
    }
  }
  if (teamTotalElmtCount) {
    const { elements, value, comparison } = teamTotalElmtCount;

    if (elements) {
      if (!isPassedComparison(allElmtCount.get(elements), value, comparison)) {
        return false;
      }
    } else if (!isPassedComparison(allElmtCount.keys.length, value, comparison)) {
      return false;
    }
  }

  return true;
}
