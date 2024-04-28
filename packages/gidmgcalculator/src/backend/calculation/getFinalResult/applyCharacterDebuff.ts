import type { CharacterPenalty, CharacterPenaltyCore } from "@Backend/types";
import type { CalcUltilInfo } from "../calculation.types";
import type { DebuffInfoWrap } from "./getFinalResult.types";

import { toArray } from "@Src/utils";
import { CharacterCalc } from "../utils";
import { applyPenalty } from "./getFinalResult.utils";

const getPenaltyValue = (penalty: CharacterPenaltyCore, info: CalcUltilInfo, inputs: number[], fromSelf: boolean) => {
  const { preExtra } = penalty;
  let result = penalty.value * CharacterCalc.getLevelScale(penalty.lvScale, info, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && CharacterCalc.isUsableEffect(preExtra, info, inputs, fromSelf)) {
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
    if (CharacterCalc.isExtensivelyUsableEffect(effect, info, inputs, fromSelf)) {
      applyPenalty({
        penaltyValue: getPenaltyValue(effect, info, inputs, fromSelf),
        targets: effect.targets,
        inputs,
        info,
        description,
      });
    }
  }
};

export default applyAbilityDebuff;
