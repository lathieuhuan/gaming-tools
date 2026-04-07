import type { TalentLevelScaleConfig } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";

export class PenaltyCalc extends AbstractPenaltyCalc {
  protected getTalentLevel(config: TalentLevelScaleConfig): number {
    return this.getInput(config.altIndex);
  }
}
