import type { TalentLevelScaleSpec } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";

export class PenaltyCalc extends AbstractPenaltyCalc {
  protected getTalentLevel(config: TalentLevelScaleSpec): number {
    return this.getInput(config.altIndex);
  }
}
