import type { InputStackSpec, TalentLevelIncrementBaseSpec } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";

export class PenaltyCalc extends AbstractPenaltyCalc {
  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.getInput(config.altIndex);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.altIndex ?? stack.index ?? 0;
  }
}
