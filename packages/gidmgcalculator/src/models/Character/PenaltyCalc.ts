import type { InputStackSpec, TalentLevelIncrementBaseSpec } from "@/types";

import { AbstractPenaltyCalc } from "../AbstractPenaltyCalc";
import { Character } from "./Character";

export class PenaltyCalc extends AbstractPenaltyCalc<Character> {
  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.performer.getFinalTalentLv(config.talent);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.index ?? 0;
  }
}
