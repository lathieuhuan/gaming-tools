import type { CalcTeamData } from "@Src/calculation/utils/CalcTeamData";
import type {
  CharacterEffectLevelIncrement,
  CharacterEffectLevelScale,
  EffectExtra,
  EffectValueByOption,
  EntityBonusBasedOn,
} from "@Src/calculation/types";
import type { TotalAttributeControl } from "../TotalAttributeControl";
import type { BonusGetterSupport } from "./BareBonusGetter.types";

import Array_ from "@Src/utils/array-utils";
import { AbstractInitialBonusGetter } from "./AbstractInitialBonusGetter";
import { getLevelScale } from "../utils/getLevelScale";
import { getIndexOfEffectValue } from "../utils/getIndexOfEffectValue";

export class InitialBonusGetter<T extends CalcTeamData = CalcTeamData> extends AbstractInitialBonusGetter {
  //
  constructor(protected fromSelf: boolean, protected teamData: T, protected totalAttrCtrl?: TotalAttributeControl) {
    super();
  }

  getLvIncre(incre: CharacterEffectLevelIncrement | undefined, inputs: number[]) {
    if (incre) {
      const { talent, value, altIndex = 0 } = incre;
      const level = this.fromSelf ? this.teamData.getFinalTalentLv(talent) : inputs[altIndex] ?? 0;
      return level * value;
    }
    return 0;
  }

  getLevelScale = (scale: CharacterEffectLevelScale | undefined, inputs: number[]): number => {
    return getLevelScale(scale, this.teamData, inputs, this.fromSelf);
  };

  protected getExtra = (extras: EffectExtra | EffectExtra[] | undefined, inputs: number[]) => {
    if (!extras) return 0;
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (this.teamData.isApplicableEffect(extra, inputs, this.fromSelf)) {
        result += extra.value;
      }
    }
    return result;
  };

  protected getBasedOn = (config: EntityBonusBasedOn, support: BonusGetterSupport) => {
    const { field, altIndex = 0, baseline = 0 } = this.parseBasedOn(config);
    let basedOnValue = 1;

    if (this.fromSelf) {
      if (this.totalAttrCtrl) {
        basedOnValue = support.basedOnStable
          ? this.totalAttrCtrl.getTotalStable(field)
          : this.totalAttrCtrl.getTotal(field);
      }
    } else {
      basedOnValue = support.inputs[altIndex] ?? 1;
    }
    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  };

  protected getIndexOfEffectValue(config: EffectValueByOption, inputs: number[]): number {
    const { preOptions } = config;
    let index = -1;

    /** Navia */
    if (preOptions && !inputs[1]) {
      const preIndex = preOptions[inputs[0]];
      index += preIndex ?? preOptions[preOptions.length - 1];
    } else {
      index = getIndexOfEffectValue(config.optIndex, this.teamData, inputs, this.fromSelf);
    }

    return index;
  }
}
