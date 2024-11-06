import { Character } from "@Src/types";
import { EffectApplicableCondition } from "../types";
import { GeneralCalc } from "./general-calc";

export function isGrantedEffect(condition: EffectApplicableCondition, char: Character) {
  if (condition.grantedAt) {
    const [prefix, level] = condition.grantedAt;
    return (prefix === "A" ? GeneralCalc.getAscension(char.level) : char.cons) >= +level;
  }
  return true;
}
