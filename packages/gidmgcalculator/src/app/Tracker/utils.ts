import type { CalcAspect, CalcAttackResult } from "@/logic/calculation";

export function resultValue(values: CalcAttackResult[], aspect: CalcAspect) {
  return Math.round(values.reduce((total, value) => total + (value[aspect] ?? 0), 0));
}
