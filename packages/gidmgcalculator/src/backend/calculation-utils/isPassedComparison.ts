import { ConditionComparison } from "../types";

export function isPassedComparison(
  value: number,
  condition: number,
  comparision: ConditionComparison = "EQUAL"
): boolean {
  switch (comparision) {
    case "EQUAL":
      return value === condition;
    case "MIN":
      return value >= condition;
    case "MAX":
      return value <= condition;
  }
}
