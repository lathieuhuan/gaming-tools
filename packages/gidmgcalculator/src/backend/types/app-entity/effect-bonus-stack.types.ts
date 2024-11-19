import type { ElementType } from "../common.types";
import type { EffectExtra } from "./effect-extra.types";
import type { EffectMax } from "./effect-max.types";

/** Only on Tulaytullah's Remembrance */
type InputIndex = {
  value: number;
  ratio?: number;
};
type InputStack = {
  type: "INPUT";
  /** If number, default to 0 */
  index?: number | InputIndex[];
  /** When this bonus is from teammate, this is input's index to get stacks. On characters */
  altIndex?: number;
  /** Input's index when activated (equal to 1), value is doubled. On some weapons */
  doubledAt?: number;
  /** Actual stack = capacity - input. On Wanderer */
  capacity?: {
    value: number;
    extra: EffectExtra;
  };
};

type ElementStack = {
  type: "ELEMENT";
  element: "SAME_INCLUDED" | "SAME_EXCLUDED" | "DIFFERENT" | ElementType;
};

/** On characterss & weapons  */
type NationStack = {
  type: "NATION";
  nation: "SAME_EXCLUDED" | "DIFFERENT" | "LIYUE";
};

type EnergyCostStack = {
  type: "ENERGY";
  /** 'ACTIVE' on Raiden Shogun. 'PARTY' on Watatsumi series */
  scope: "ACTIVE" | "PARTY";
};
/** On Raiden Shogun */
type ResolveStack = {
  type: "RESOLVE";
};

/** Temporary for Shattered Chains (bow) */
type MixStack = {
  type: "MIX";
};

export type EntityBonusStack = (InputStack | ElementStack | NationStack | EnergyCostStack | ResolveStack | MixStack) & {
  /** actual stacks = stacks - baseline */
  baseline?: number;
  /** On Furina */
  extra?: EffectExtra;
  max?: EffectMax;
};
