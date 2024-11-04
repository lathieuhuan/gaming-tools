import type { EntityBonusBasedOn } from "./app-entity-common.types";
import type { EffectExtra } from "./effect-extra.types";

type EffectDynamicMax = {
  value: number;
  /** On Hu Tao */
  basedOn?: EntityBonusBasedOn;
  extras?: EffectExtra | EffectExtra[];
};

export type EffectMax = number | EffectDynamicMax;
