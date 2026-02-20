import type { EffectInputCondition, InputCheck, MultipleInputCheck } from "@/types";
import { isPassedComparison } from "./isPassedComparison";

function isMultipleChecks(inputCheck: EffectInputCondition): inputCheck is MultipleInputCheck {
  return typeof inputCheck === "object" && "relation" in inputCheck;
}

function isInvalidInput(inputs: number[], inputCheck: number | InputCheck) {
  const {
    value,
    inpIndex = 0,
    comparison = "EQUAL",
  } = typeof inputCheck === "number" ? { value: inputCheck } : inputCheck;
  const input = inputs[inpIndex];

  return input === undefined || !isPassedComparison(input, value, comparison);
}

export function isValidInput(condition: EffectInputCondition | undefined, inputs: number[]) {
  if (condition !== undefined) {
    if (isMultipleChecks(condition)) {
      switch (condition.relation) {
        case "AND":
          if (condition.checks.some((check) => isInvalidInput(inputs, check))) {
            return false;
          }
          break;
        case "OR":
          if (condition.checks.every((check) => isInvalidInput(inputs, check))) {
            return false;
          }
          break;
      }
    } else if (isInvalidInput(inputs, condition)) {
      return false;
    }
  }

  return true;
}
