import type { CharacterEffectLevelIncrement, BonusAttributeBaseSpec } from "./common-specs";
import type { EffectExtra } from "./effect-extra";

export type EffectDynamicMax = {
  value: number;
  /** incre on weapon refine */
  incre?: number;
  /** Incre based on character talent level. */
  lvIncre?: CharacterEffectLevelIncrement;
  /** On Hu Tao */
  basedOn?: BonusAttributeBaseSpec;
  extras?: EffectExtra | EffectExtra[];
};

export type EffectMax = number | EffectDynamicMax;
