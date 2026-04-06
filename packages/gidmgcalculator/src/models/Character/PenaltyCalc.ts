import type { TalentLevelScaleConfig } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";
import { Character } from "./Character";

export class PenaltyCalc extends AbstractPenaltyCalc<Character> {
  protected getTalentLevel(config: TalentLevelScaleConfig): number {
    return this.performer.getFinalTalentLv(config.talent);
  }
}
