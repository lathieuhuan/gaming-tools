import type { TalentLevelScaleSpec } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";
import { Character } from "./Character";

export class PenaltyCalc extends AbstractPenaltyCalc<Character> {
  protected getTalentLevel(config: TalentLevelScaleSpec): number {
    return this.performer.getFinalTalentLv(config.talent);
  }
}
