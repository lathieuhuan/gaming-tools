import type { EffectCondition } from "./effect-condition";

export type EffectExtra = EffectCondition & {
  value: number;
};
