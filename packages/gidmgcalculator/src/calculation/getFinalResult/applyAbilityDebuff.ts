import { ELEMENT_TYPES } from "@Src/constants";
import { CharacterPenalty, DebuffInfoWrap, CharacterPenaltyConfig } from "@Src/types";
import { toArray } from "@Src/utils";
import { CalcUltilInfo } from "../calculation.types";
import { CharacterCal, applyModifier } from "../utils";

const getPenaltyValue = (
  penalty: CharacterPenaltyConfig,
  info: CalcUltilInfo,
  inputs: number[],
  fromSelf: boolean
) => {
  const { preExtra } = penalty;
  let result = penalty.value * CharacterCal.getLevelScale(penalty.lvScale, info, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && CharacterCal.isUsable(preExtra, info, inputs, fromSelf)) {
    result += getPenaltyValue(preExtra, info, inputs, fromSelf);
  }
  if (penalty.max && result > penalty.max) result = penalty.max;

  return Math.max(result, 0);
};

interface ApplyAbilityDebuffArgs {
  description: string;
  effects: CharacterPenalty | CharacterPenalty[];
  inputs: number[];
  infoWrap: DebuffInfoWrap;
  fromSelf: boolean;
}
const applyAbilityDebuff = ({ description, effects, infoWrap: info, inputs, fromSelf }: ApplyAbilityDebuffArgs) => {
  for (const effect of toArray(effects)) {
    if (CharacterCal.isExtensivelyUsable(effect, info, inputs, fromSelf)) {
      const penaltyValue = getPenaltyValue(effect, info, inputs, fromSelf);

      for (const target of toArray(effect.targets)) {
        if (typeof target === "string") {
          applyModifier(description, info.resistReduct, target, penaltyValue, info.tracker);
        } else {
          const elmtIndex = inputs[target.index ?? 0];
          applyModifier(description, info.resistReduct, ELEMENT_TYPES[elmtIndex], penaltyValue, info.tracker);
        }
      }
    }
  }
};

export default applyAbilityDebuff;
