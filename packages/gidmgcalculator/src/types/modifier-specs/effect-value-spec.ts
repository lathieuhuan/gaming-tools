import type { EffectExtraSpec } from "./effect-extra-spec";

export type EffectValueByOptionSpec = {
  options: number[];
  /** Default 0 */
  inpIndex?: number;

  // ===== On BUFF / BONUS =====

  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Columbina */
  extra?: EffectExtraSpec;
};

export type EffectValueSpec = number | EffectValueByOptionSpec;
