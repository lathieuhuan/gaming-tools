import type { TalentLevelScaleConfig } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";
import { CalcCharacter } from "./CalcCharacter";

export class PenaltyCalc extends AbstractPenaltyCalc<CalcCharacter> {
  protected getTalentLevel(config: TalentLevelScaleConfig): number {
    return this.performer.getFinalTalentLv(config.talent);
  }
}
