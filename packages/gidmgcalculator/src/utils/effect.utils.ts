import type { ConditionComparison, InputCheckSpec } from "@/types";

export function isPassedComparison(
  value: number,
  condition: number,
  comparison: ConditionComparison = "EQUAL",
): boolean {
  switch (comparison) {
    case "EQUAL":
      return value === condition;
    case "MIN":
      return value >= condition;
    case "MAX":
      return value <= condition;
    default:
      return false;
  }
}

export function isInvalidInput(inputs: number[], inputCheck?: number | InputCheckSpec) {
  //
  if (inputCheck === undefined) {
    return false;
  }

  const {
    value,
    index = 0,
    comparison = "EQUAL",
  } = typeof inputCheck === "number" ? { value: inputCheck } : inputCheck;
  const input = inputs[index];

  return input === undefined || !isPassedComparison(input, value, comparison);
}
