import type { CalcAspect, CalcResultItemValue } from "@/calculation/types";

export function itemValue(values: CalcResultItemValue[], aspect: CalcAspect) {
  return Math.round(values.reduce((total, value) => total + (value[aspect] ?? 0), 0));
}
