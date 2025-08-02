import type { CharacterEffectLevelScale } from "@Src/calculation/types";
import type { CalcTeamData } from "@Src/calculation/utils/CalcTeamData";

import { CharacterCalc } from "@Src/calculation/utils/calc-utils";

export const getTeammateLevelScale = (scale: CharacterEffectLevelScale | undefined, inputs: number[]): number => {
  if (scale) {
    const { value, altIndex = 0, max } = scale;
    const level = inputs[altIndex] ?? 0;
    const result = value ? CharacterCalc.getTalentMult(value, level) : level;
    return max && result > max ? max : result;
  }
  return 1;
};

export const getLevelScale = (
  scale: CharacterEffectLevelScale | undefined,
  teamData: CalcTeamData,
  inputs: number[],
  fromSelf: boolean
): number => {
  if (scale) {
    const { talent, value, altIndex = 0, max } = scale;
    const level = fromSelf ? teamData.getFinalTalentLv(talent) : inputs[altIndex] ?? 0;
    const result = value ? CharacterCalc.getTalentMult(value, level) : level;
    return max && result > max ? max : result;
  }
  return 1;
};
