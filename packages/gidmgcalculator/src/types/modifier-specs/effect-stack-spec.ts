import type { ElementType } from "../common";
import type { EffectPerformableConditionSpecs } from "./effect-condition-specs";
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

export type ElementStackSpec = {
  /** Count unique element types of the party. Ex: [Pyro, Pyro] -> 1 */
  type: "ELEMENT";
  elements?: ElementType[];
};

export type MemberStackSpec = {
  /** Count members with some specific element types. Ex: [Pyro, Pyro] -> 2 */
  type: "MEMBER";
  element: "SAME_INCLUDED" | "SAME_EXCLUDED" | "DIFFERENT" | ElementType | ElementType[];
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

/** Special for Chain Breaker (bow) */
export type MixStackSpec = {
  type: "MIX";
};

export type EffectStackSpec = (
  | InputStackSpec
  | ElementStackSpec
  | MemberStackSpec
  | NationStackSpec
  | EnergyCostStackSpec
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

export type StacksBonusSpec = EffectPerformableConditionSpecs & {
  /** Default 'FIN' */
  at?: "FIN" | number;
  value: number;
};
