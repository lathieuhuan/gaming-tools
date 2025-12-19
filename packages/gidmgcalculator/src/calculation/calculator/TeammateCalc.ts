import type { BareBonus, BonusPerformTools, EntityBonusEffect, EntityPenaltyEffect } from "@/types";
import type { IEffectPerformer } from "../types";

import { Teammate } from "@/models/base";
import { BonusCalc, PenaltyCalc } from "@/models/calculator";

export class TeammateCalc extends Teammate implements IEffectPerformer {
  //
  performBonus(
    config: EntityBonusEffect,
    { inputs = [], refi = 0, basedOnFixed = false }: Partial<BonusPerformTools>
  ): BareBonus {
    return new BonusCalc(this, this.team, { inputs, refi, basedOnFixed }).makeBonus(config);
  }

  performPenalty(config: EntityPenaltyEffect, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).makePenalty(config);
  }
}
