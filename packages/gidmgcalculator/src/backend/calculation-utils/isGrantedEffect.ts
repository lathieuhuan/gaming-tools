import type { Character } from "@Src/types";
import type { EffectApplicableCondition } from "../types";
import { GeneralCalc } from "../common-utils";

export function isGrantedEffect(condition: Pick<EffectApplicableCondition, "grantedAt">, character: Character) {
  if (condition.grantedAt) {
    const [prefix, level] = condition.grantedAt;
    return (prefix === "A" ? GeneralCalc.getAscension(character.level) : character.cons) >= +level;
  }
  return true;
}
