import type { EffectInputCondition, InputCheck } from "@Src/calculation/types";
import { isPassedComparison } from "./isPassedComparison";

function isInvalidInput(inputs: number[], inputCheck: InputCheck) {
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
    if (Array.isArray(condition)) {
      if (condition.some((check) => isInvalidInput(inputs, check))) {
        return false;
      }
    } else {
      const singleCheckInput: InputCheck = typeof condition === "number" ? { value: condition } : condition;

      if (isInvalidInput(inputs, singleCheckInput)) {
        return false;
      }
    }
  }
  return true;
}
