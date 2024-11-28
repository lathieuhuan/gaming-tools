import type { Character } from "@Src/types";
import type { EffectApplicableCondition } from "../types";
import { GeneralCalc } from "../common-utils";

export function isGrantedEffect(condition: Pick<EffectApplicableCondition, "grantedAt">, char: Character) {
  if (condition.grantedAt) {
    const [prefix, level] = condition.grantedAt;
    return (prefix === "A" ? GeneralCalc.getAscension(char.level) : char.cons) >= +level;
  }
  return true;
}
