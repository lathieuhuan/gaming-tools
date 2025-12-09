import type { ElementType } from "../common";
import type { TalentLevelScaleConfig } from "./app-entity-common";
import type { EffectExtra } from "./effect-extra";
import type { EffectMax } from "./effect-max";

type InputOptionIndex = {
  source: "INPUT";
  inpIndex: number;
};
/** Count distinct element types of teammates. Ex: [Pyro, Pyro] -> 1 */
type ElementOptionIndex = {
  source: "ELEMENT";
  elements?: ElementType[];
};
/** Count members of element types of teammates. Ex: [Pyro, Pyro] -> 2 */
type MemberOptionIndex = {
  source: "MEMBER";
  element: "DIFFERENT" | ElementType | ElementType[];
};
/** On Razor */
export type LevelOptionIndex = TalentLevelScaleConfig & {
  source: "LEVEL";
};

export type EffectValueByOption = {
  options: number[];
  /** Default InputOptionIndex = { source: "INPUT"; inpIndex: 0; } */
  optIndex?: InputOptionIndex | ElementOptionIndex | MemberOptionIndex | LevelOptionIndex;

  // ===== On BUFF / BONUS =====

  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Nahida */
  extra?: EffectExtra;
  /** Max optIndex. Dynamic on Navia */
  max?: EffectMax;
};

export type EffectValue = number | EffectValueByOption;
