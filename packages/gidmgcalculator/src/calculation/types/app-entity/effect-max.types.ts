import type { CharacterEffectLevelIncrement, EntityBonusBasedOn } from "./app-entity-common.types";
import type { EffectExtra } from "./effect-extra.types";

export type EffectDynamicMax = {
  value: number;
  /** incre on weapon refine */
  incre?: number;
  /** incre on character talent level */
  lvIncre?: CharacterEffectLevelIncrement;
  /** On Hu Tao */
  basedOn?: EntityBonusBasedOn;
  extras?: EffectExtra | EffectExtra[];
};

export type EffectMax = number | EffectDynamicMax;
