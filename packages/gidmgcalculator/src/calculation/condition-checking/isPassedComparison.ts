import { ConditionComparison } from "@/calculation/types";

export function isPassedComparison(
  value: number,
  condition: number,
  comparison: ConditionComparison = "EQUAL"
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
