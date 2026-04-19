import type { ElementType } from "../common";
import type { EffectExtraSpec } from "./effect-extra-spec";
import type { EffectMaxSpec } from "./effect-max-spec";

/** Only on Tulaytullah's Remembrance */
type InputIndexSpec = {
  value: number;
  ratio?: number;
};
export type InputStackSpec = {
  type: "INPUT";
  /** If number, default to 0 */
  index?: number | InputIndexSpec[];
  /** When this bonus is from teammate, this is input's index to get stacks. On characters */
  altIndex?: number;
  /** Input's index when activated (equal to 1), value is doubled. On some weapons */
  doubledAt?: number;
};

/** Count members of element types of teammates. Ex: [Pyro, Pyro] -> 2 */
export type MemberStackSpec = {
  type: "MEMBER";
  element: "SAME_INCLUDED" | "SAME_EXCLUDED" | "DIFFERENT" | ElementType;
};

/** On characterss & weapons  */
export type NationStackSpec = {
  type: "NATION";
  nation: "SAME_EXCLUDED" | "DIFFERENT" | "LIYUE";
};

export type EnergyCostStackSpec = {
  type: "ENERGY";
  /** 'ACTIVE' on Raiden Shogun. 'PARTY' on Watatsumi series */
  scope: "ACTIVE" | "PARTY";
};

/** On Raiden Shogun */
export type ResolveStackSpec = {
  type: "RESOLVE";
};

/** Special for Chain Breaker (bow) */
export type MixStackSpec = {
  type: "MIX";
};

export type BonusStackSpec = (
  | InputStackSpec
  | MemberStackSpec
  | NationStackSpec
  | EnergyCostStackSpec
  | ResolveStackSpec
  | MixStackSpec
) & {
  /** Actual stack = capacity - input. On Wanderer */
  capacity?: {
    value: number;
    extra: EffectExtraSpec;
  };
  /** Actual stacks = stacks - baseline */
  baseline?: number;
  /** On Furina */
  extra?: EffectExtraSpec;
  max?: EffectMaxSpec;
};
