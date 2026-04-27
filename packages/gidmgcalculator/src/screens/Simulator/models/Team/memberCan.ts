import type { EffectPerformableConditionSpecs, TeamConditionSpecs } from "@/types";
import type { Team } from "./Team";

import { isPassedComparison } from "@/models/utils/isPassedComparison";
import { isValidInput } from "@/models/utils/isValidInput";

export function memberCan(memberCode: number, team: Team) {
  const member = team.getMember(memberCode);

  function canPerformEffect(condition: EffectPerformableConditionSpecs, inputs: number[] = []) {
    const { grantedAt } = condition;

    if (grantedAt) {
      const { value } = typeof grantedAt === "string" ? { value: grantedAt } : grantedAt;
      const [prefix, level] = value;
      const isGranted = (prefix === "A" ? member.ascension : member.cons) >= +level;

      if (!isGranted) {
        return false;
      }
    }

    if (condition.beEnhanced && !member.enhanced) {
      return false;
    }

    if (condition.checkMixed) {
      const mixedCount = team.getMixedCount(member.data.vision);

      if (!isPassedComparison(mixedCount, 3, "MIN")) {
        return false;
      }
    }

    if (condition.checkAny) {
      const anyInvalid = condition.checkAny.some(
        (condition) => !canPerformEffect(condition, inputs)
      );

      if (anyInvalid) {
        return false;
      }
    }

    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }

  function performEffect(
    condition: TeamConditionSpecs & EffectPerformableConditionSpecs,
    inputs?: number[]
  ): boolean {
    return team.state.isAvailableEffect(condition) && canPerformEffect(condition, inputs);
  }

  return {
    performEffect,
  };
}
