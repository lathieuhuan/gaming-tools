import type { ElementType } from "../common";
import type { EffectExtra } from "./effect-extra";
import type { EffectMax } from "./effect-max";

/** Only on Tulaytullah's Remembrance */
type InputIndex = {
  value: number;
  ratio?: number;
};
export type InputStack = {
  type: "INPUT";
  /** If number, default to 0 */
  index?: number | InputIndex[];
  /** When this bonus is from teammate, this is input's index to get stacks. On characters */
  altIndex?: number;
  /** Input's index when activated (equal to 1), value is doubled. On some weapons */
  doubledAt?: number;
};

/** Count members of element types of teammates. Ex: [Pyro, Pyro] -> 2 */
export type MemberStack = {
  type: "MEMBER";
  element: "SAME_INCLUDED" | "SAME_EXCLUDED" | "DIFFERENT" | ElementType;
};

/** On characterss & weapons  */
export type NationStack = {
  type: "NATION";
  nation: "SAME_EXCLUDED" | "DIFFERENT" | "LIYUE";
};

export type EnergyCostStack = {
  type: "ENERGY";
  /** 'ACTIVE' on Raiden Shogun. 'PARTY' on Watatsumi series */
  scope: "ACTIVE" | "PARTY";
};

/** On Raiden Shogun */
export type ResolveStack = {
  type: "RESOLVE";
};

/** Special for Chain Breaker (bow) */
export type MixStack = {
  type: "MIX";
};

export type EntityBonusStack = (InputStack | MemberStack | NationStack | EnergyCostStack | ResolveStack | MixStack) & {
  /** Actual stack = capacity - input. On Wanderer */
  capacity?: {
    value: number;
    extra: EffectExtra;
  };
  /** Actual stacks = stacks - baseline */
  baseline?: number;
  /** On Furina */
  extra?: EffectExtra;
  max?: EffectMax;
};
