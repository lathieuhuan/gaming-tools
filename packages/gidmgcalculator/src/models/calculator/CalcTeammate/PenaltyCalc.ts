import type { TalentLevelScaleConfig } from "@/types";

import { AbstractPenaltyCalc } from "@/models/base";

export class PenaltyCalc extends AbstractPenaltyCalc {
  protected getTalentLevel(config: TalentLevelScaleConfig): number {
    return this.getInput(config.altIndex);
  }
}
