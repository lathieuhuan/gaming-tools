import type { ElementType, LevelableTalentType } from "../common.types";
import type { EffectExtra } from "./effect-extra.types";
import type { EffectMax } from "./effect-max.types";

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
type LevelOptionIndex = {
  source: "LEVEL";
  talent: LevelableTalentType;
  /** When this bonus is from teammate, this is input's index to check granted. Default to 0 */
  altIndex?: number;
};

export type EffectValueByOption = {
  options: number[];
  /** If number, [source] is "INPUT", [inpIndex] is the number. Default to 0 */
  optIndex?: number | InputOptionIndex | ElementOptionIndex | MemberOptionIndex | LevelOptionIndex;

  // ===== On BUFF / BONUS =====

  /** On Navia */
  preOptions?: number[];
  /** Add to optIndex. On Nahida */
  extra?: EffectExtra;
  /** Max optIndex. Dynamic on Navia */
  max?: EffectMax;
};
