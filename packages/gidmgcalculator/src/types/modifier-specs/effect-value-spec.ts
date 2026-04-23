import type { ElementType } from "../common";
import type { EffectExtraSpec } from "./effect-extra-spec";
import type { EffectMaxSpec } from "./effect-max-spec";

type InputOptionIndexSpec = {
  source: "INPUT";
  inpIndex: number;
};
// TODO migrate to stack
/** Count distinct element types of teammates. Ex: [Pyro, Pyro] -> 1 */
type ElementOptionIndexSpec = {
  source: "ELEMENT";
  elements?: ElementType[];
};

export type EffectValueByOptionSpec = {
  options: number[];
  /** Default InputOptionIndex = { source: "INPUT"; inpIndex: 0; } */
  optIndex?: InputOptionIndexSpec | ElementOptionIndexSpec;

  // ===== On BUFF / BONUS =====

  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Nahida */
  extra?: EffectExtraSpec;
  /** Max optIndex. Dynamic on Navia */
  max?: EffectMaxSpec;
};

export type EffectValueSpec = number | EffectValueByOptionSpec;
