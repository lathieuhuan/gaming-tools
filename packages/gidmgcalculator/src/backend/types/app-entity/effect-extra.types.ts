import type { EffectApplicableCondition } from "./effect-condition.types";

export type EffectExtra = EffectApplicableCondition & {
  value: number;
};
