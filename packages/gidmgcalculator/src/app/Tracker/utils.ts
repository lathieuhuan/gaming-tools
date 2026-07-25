import type { CalcAspect, CalcResultItemValue } from "@/calculation/types";

export function resultValue(values: CalcResultItemValue[], aspect: CalcAspect) {
  return Math.round(values.reduce((total, value) => total + (value[aspect] ?? 0), 0));
}
