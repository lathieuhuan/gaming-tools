import type { Character } from "@Src/types";
import type { EffectApplicableCondition, EffectUsableCondition } from "@Src/backend/types";
import type { CharacterRecord } from "../common-utils/character-record";

import Array_ from "@Src/utils/array-utils";
import TypeCounter from "@Src/utils/type-counter";
import { isGrantedEffect } from "./isGrantedEffect";
import { isPassedComparison } from "./isPassedComparison";

function isUsableEffect(condition: EffectUsableCondition, record: CharacterRecord, inputs: number[]) {
  const { checkInput, checkParty } = condition;

  if (checkInput !== undefined) {
    const {
      value,
      inpIndex = 0,
      comparison = "EQUAL",
    } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
    const input = inputs[inpIndex];

    if (input === undefined || !isPassedComparison(input, value, comparison)) {
      return false;
    }
  }
  if (checkParty !== undefined) {
    let input = 0;

    switch (checkParty.type) {
      case "DISTINCT_ELMT":
        input = record.allElmtCount.keys.length;
        break;
      case "MIXED":
        if (record.appCharacter.nation === "natlan") input += 1;

        Array_.truthyOp(record.appParty).each((data) => {
          if (data.nation === "natlan" || data.vision !== record.appCharacter.vision) {
            input += 1;
          }
        });
        break;
    }
    if (!isPassedComparison(input, checkParty.value, checkParty.comparison)) {
      return false;
    }
  }
  return true;
}

function isAvailableEffect(
  condition: EffectApplicableCondition,
  character: Character,
  inputs: number[],
  fromSelf: boolean
): boolean {
  if (fromSelf) {
    if (!isGrantedEffect(condition, character)) return false;
  } else if (condition.altIndex !== undefined && !inputs[condition.altIndex]) {
    return false;
  }
  return true;
}

export function isApplicableEffect(
  condition: EffectApplicableCondition,
  record: CharacterRecord,
  inputs: number[],
  fromSelf = false
): boolean {
  const allElmtCount = record.allElmtCount;

  if (!isUsableEffect(condition, record, inputs)) {
    return false;
  }
  if (!isAvailableEffect(condition, record.character, inputs, fromSelf)) {
    return false;
  }

  const { totalPartyElmtCount, partyElmtCount, partyOnlyElmts } = condition;

  if (condition.forWeapons && !condition.forWeapons.includes(record.appCharacter.weaponType)) {
    return false;
  }
  if (condition.forElmts && !condition.forElmts.includes(record.appCharacter.vision)) {
    return false;
  }

  if (totalPartyElmtCount) {
    const { elements, value, comparison } = totalPartyElmtCount;

    switch (comparison) {
      case "MAX":
        if (allElmtCount.get(elements) > value) return false;
    }
  }
  if (partyElmtCount) {
    const requiredEntries = new TypeCounter(partyElmtCount).entries;

    if (requiredEntries.some(([type, value]) => allElmtCount.get(type) < value)) {
      return false;
    }
  }
  if (partyOnlyElmts && allElmtCount.keys.some((elementType) => !partyOnlyElmts.includes(elementType))) {
    return false;
  }
  return true;
}
