import type { Infusion } from "@Src/types";
import type { AttackBonusesArchive, TrackerControl } from "@Src/backend/controls";
import type {
  AttackPattern,
  CalculationInfo,
  NormalAttacksConfig,
  ResistanceReduction,
  TotalAttribute,
} from "@Src/backend/types";

import { CalcItemCalculatorCore } from "./calc-item-calculator-core";
import { AttackPatternCalculator } from "./attack-pattern-calculator";

export class InternalCalcItemCalculator extends CalcItemCalculatorCore {
  constructor(
    targetLv: number,
    public calcInfo: CalculationInfo,
    public NAsConfig: NormalAttacksConfig,
    public customInfusion: Infusion,
    public totalAttr: TotalAttribute,
    public attkBonusesArchive: AttackBonusesArchive,
    resistances: ResistanceReduction,
    public tracker?: TrackerControl
  ) {
    super(calcInfo.char.level, targetLv, totalAttr, resistances);
  }

  genAttPattCalculator = (patternKey: AttackPattern) => {
    return new AttackPatternCalculator(patternKey, this);
  };

  expose = () => {
    return {
      genAttPattCalculator: this.genAttPattCalculator,
      calculate: this.calculate,
    };
  };
}
