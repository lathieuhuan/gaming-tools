import type { EffectPerformableConditionSpecs, EffectReceiverConditionSpecs } from "@/types";
import type { Member } from "../models/Member";
import type { Team } from "../models/Team";

import { isPassedComparison } from "@/models/utils/isPassedComparison";
import { isValidInput } from "@/models/utils/isValidInput";

export function memberCan(member: Member, team: Team) {
  //
  function performEffect(condition: EffectPerformableConditionSpecs, inputs: number[] = []) {
    if (!team.state.isAvailableEffect(condition)) {
      return false;
    }

    if (condition.checkMixed) {
      const mixedCount = team.getMixedCount(member.data.vision);

      if (!isPassedComparison(mixedCount, 3, "MIN")) {
        return false;
      }
    }

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

    if (condition.checkAny) {
      const anyInvalid = condition.checkAny.some((condition) => !performEffect(condition, inputs));

      if (anyInvalid) {
        return false;
      }
    }

    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }

  // TODO also check for monoId
  function receiveBonus(condition: EffectReceiverConditionSpecs) {
    const { data } = member;

    if (condition.forNation && condition.forNation !== data.nation) {
      return false;
    }
    if (condition.forWeapons && !condition.forWeapons.includes(data.weaponType)) {
      return false;
    }
    if (condition.forElmts && !condition.forElmts.includes(data.vision)) {
      return false;
    }
    if (condition.forName && !data.name.includes(condition.forName)) {
      return false;
    }
    if (condition.forEnergyCap) {
      const { value, comparison } = condition.forEnergyCap;

      if (!isPassedComparison(data.EBcost, value, comparison)) {
        return false;
      }
    }

    const { forEnhance } = condition;

    if (forEnhance) {
      if (forEnhance === "MOONSIGN") {
        if (data.faction !== "moonsign") {
          return false;
        }
      } else if (!member.enhanced || data.enhanceType !== forEnhance) {
        return false;
      }
    }

    return true;
  }

  return {
    performEffect,
    receiveBonus,
  };
}

export type MemberCan = ReturnType<typeof memberCan>;
