import type { BonusAttributeScalingSpec, TalentLevelIncrementSpec } from "./common-specs";
import type { EffectExtraSpec } from "./effect-extra-spec";

export type EffectDynamicMaxSpec = {
  value: number;
  /** incre on weapon refine */
  incre?: number;
  /** Incre based on character talent level. */
  lvIncre?: TalentLevelIncrementSpec;
  /** On Hu Tao */
  basedOn?: BonusAttributeScalingSpec;
  extras?: EffectExtraSpec | EffectExtraSpec[];
};

export type EffectMaxSpec = number | EffectDynamicMaxSpec;
