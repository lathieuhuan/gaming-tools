import type { TalentLevelScaleConfig } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";
import { CharacterCalc } from "./CharacterCalc";

export class PenaltyCalc extends AbstractPenaltyCalc<CharacterCalc> {
  protected getTalentLevel(config: TalentLevelScaleConfig): number {
    return this.performer.getFinalTalentLv(config.talent);
  }
}
