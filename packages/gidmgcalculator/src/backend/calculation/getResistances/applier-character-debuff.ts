import type { CharacterPenalty, CharacterPenaltyCore } from "@Src/backend/types";
import type { CalculationInfo } from "@Src/backend/utils";
import type { DebuffInfoWrap } from "./getResistances.types";

import { toArray } from "@Src/utils";
import { CharacterCalc, EntityCalc } from "../../utils";
import { applyPenalty } from "./getResistances.utils";

class ApplierCharacterDebuff {
  info: DebuffInfoWrap;

  constructor(info: DebuffInfoWrap) {
    this.info = info;
  }

  private getPenaltyValue(penalty: CharacterPenaltyCore, info: CalculationInfo, inputs: number[], fromSelf: boolean) {
    const { preExtra } = penalty;
    let result = penalty.value * CharacterCalc.getLevelScale(penalty.lvScale, info, inputs, fromSelf);

    if (typeof preExtra === "number") {
      result += preExtra;
    } else if (preExtra && EntityCalc.isApplicableEffect(preExtra, info, inputs, fromSelf)) {
      result += this.getPenaltyValue(preExtra, info, inputs, fromSelf);
    }
    if (penalty.max && result > penalty.max) result = penalty.max;

    return Math.max(result, 0);
  }

  apply(args: {
    description: string;
    effects: CharacterPenalty | CharacterPenalty[];
    inputs: number[];
    fromSelf: boolean;
  }) {
    const { inputs } = args;

    for (const effect of toArray(args.effects)) {
      if (EntityCalc.isApplicableEffect(effect, this.info, inputs, args.fromSelf)) {
        applyPenalty({
          penaltyValue: this.getPenaltyValue(effect, this.info, inputs, args.fromSelf),
          targets: effect.targets,
          inputs,
          info: this.info,
          description: args.description,
        });
      }
    }
  }
}

export default ApplierCharacterDebuff;
