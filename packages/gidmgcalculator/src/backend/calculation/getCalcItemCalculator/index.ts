import { InternalCalcItemCalculator } from "./calc-item-calculator";

export default function getCalcItemCalculator(...args: ConstructorParameters<typeof InternalCalcItemCalculator>) {
  return new InternalCalcItemCalculator(...args).expose();
}

export type CalcItemCalculator = ReturnType<typeof getCalcItemCalculator>;
