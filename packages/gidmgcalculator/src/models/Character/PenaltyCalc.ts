import type { TalentLevelIncrementBaseSpec } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";
import { Character } from "./Character";

export class PenaltyCalc extends AbstractPenaltyCalc<Character> {
  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.performer.getFinalTalentLv(config.talent);
  }
}
