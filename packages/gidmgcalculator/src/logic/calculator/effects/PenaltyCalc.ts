import type { Character } from "@/models";
import type { InputStackSpec, TalentLevelIncrementBaseSpec } from "@/types";

import { AbstractPenaltyCalc } from "./AbstractPenaltyCalc";

export class PenaltyCalc extends AbstractPenaltyCalc<Character> {
  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.performer.finalTalentLv(config.talent);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.index ?? 0;
  }
}
