import type { TalentLevelIncrementBaseSpec } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";

export class PenaltyCalc extends AbstractPenaltyCalc {
  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.getInput(config.altIndex);
  }
}
