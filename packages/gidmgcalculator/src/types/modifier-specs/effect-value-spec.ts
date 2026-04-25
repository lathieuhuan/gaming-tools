import type { EffectExtraSpec } from "./effect-extra-spec";
import type { EffectMaxSpec } from "./effect-max-spec";

type InputOptionIndexSpec = {
  source: "INPUT";
  inpIndex: number;
};

export type EffectValueByOptionSpec = {
  options: number[];
  /** Default InputOptionIndex = { source: "INPUT"; inpIndex: 0; } */
  optIndex?: InputOptionIndexSpec;

  // ===== On BUFF / BONUS =====

  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Nahida */
  extra?: EffectExtraSpec;
  /** Max optIndex. Dynamic on Navia */
  max?: EffectMaxSpec;
};

export type EffectValueSpec = number | EffectValueByOptionSpec;
