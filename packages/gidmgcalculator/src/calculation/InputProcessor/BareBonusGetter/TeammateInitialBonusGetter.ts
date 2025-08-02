import type {
  CharacterEffectLevelIncrement,
  CharacterEffectLevelScale,
  EffectExtra,
  EntityBonusBasedOn,
  EffectValueByOption,
} from "@Src/calculation/types";
import type { BonusGetterSupport } from "./BareBonusGetter.types";

import { isValidInput } from "@Src/calculation/utils/condition-checking";
import Array_ from "@Src/utils/array-utils";
import { AbstractInitialBonusGetter } from "./AbstractInitialBonusGetter";
import { getTeammateLevelScale } from "../utils/getLevelScale";
import { parseOptIndex } from "../utils/getIndexOfEffectValue";

/** This class is not used in src/calculation */
export class TeammateInitialBonusGetter extends AbstractInitialBonusGetter {
  //

  getLvIncre(incre: CharacterEffectLevelIncrement | undefined, inputs: number[]) {
    if (incre) {
      const { value, altIndex = 0 } = incre;
      const level = inputs[altIndex] ?? 0;
      return level * value;
    }
    return 0;
  }

  getLevelScale = (scale: CharacterEffectLevelScale | undefined, inputs: number[]): number => {
    return getTeammateLevelScale(scale, inputs);
  };

  protected getExtra = (extras: EffectExtra | EffectExtra[] | undefined, inputs: number[]) => {
    if (!extras) return 0;
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (isValidInput(extra.checkInput, inputs)) {
        result += extra.value;
      }
    }
    return result;
  };

  protected getBasedOn = (config: EntityBonusBasedOn, support: BonusGetterSupport) => {
    const { field, altIndex = 0, baseline = 0 } = this.parseBasedOn(config);
    const basedOnValue = support.inputs[altIndex] ?? 1;

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  };

  protected getIndexOfEffectValue(config: EffectValueByOption, inputs: number[]): number {
    const indexConfig = parseOptIndex(config.optIndex);
    let indexValue = -1;

    if (indexConfig.source === "INPUT") {
      indexValue += inputs[indexConfig.inpIndex] ?? 0;
    }
    return indexValue;
  }
}
