import type { ElementType, LevelableTalentType } from "../common.types";

type InputOptionIndex = {
  source: "INPUT";
  inpIndex: number;
};
/** Count distinct element types of the party. Ex: [Pyro, Pyro] -> 1 */
type ElementOptionIndex = {
  source: "ELEMENT";
  elements?: ElementType[];
};
/** Count members of element types of the party. Ex: [Pyro, Pyro] -> 2 */
type MemberOptionIndex = {
  source: "MEMBER";
  element: "DIFFERENT" | ElementType | ElementType[];
};
/** On Razor */
type LevelOptionIndex = {
  source: "LEVEL";
  talent: LevelableTalentType;
};

export type EffectValueByOption = {
  options: number[];
  /** If number, [source] is "INPUT", [inpIndex] is the number. Default to 0 */
  optIndex?: number | InputOptionIndex | ElementOptionIndex | MemberOptionIndex | LevelOptionIndex;
};
