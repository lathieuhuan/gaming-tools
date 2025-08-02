import type { ElementModCtrl } from "@Src/types";
import type { TrackerControl } from "../utils/TrackerControl";
import type { CalculationFinalResultAttackItem, Level, ResistReduction, TransformativeReaction } from "../types";
import type { CalcItemCalculator } from "./CalcItemCalculator";

import { GeneralCalc } from "../utils/calc-utils";
import { TRANSFORMATIVE_REACTION_CONFIG } from "../constants/internal";

export class ReactionCalculator {
  private baseDmg: number;

  constructor(
    characterLv: Level,
    private itemCalculator: CalcItemCalculator,
    private resistances: ResistReduction,
    private tracker?: TrackerControl
  ) {
    this.baseDmg = GeneralCalc.getBaseRxnDamage(characterLv);
  }

  calculate = (reaction: TransformativeReaction, elmtModCtrl?: ElementModCtrl): CalculationFinalResultAttackItem => {
    const { getBonus, getRxnMult } = this.itemCalculator;

    const config = TRANSFORMATIVE_REACTION_CONFIG[reaction];
    const baseValue = this.baseDmg * config.mult;
    const bonusMult = 1 + getBonus("pct_", reaction) / 100;
    const flat = getBonus("flat", reaction);
    let attElmt = config.attElmt;
    let rxnMult = 1;
    let resMult = 1;

    if (config.attElmt === "absorb") {
      if (elmtModCtrl?.absorption) {
        attElmt = elmtModCtrl?.absorption;
        rxnMult = getRxnMult(attElmt, elmtModCtrl.absorb_reaction);
        resMult = this.resistances[attElmt];
      }
    } else {
      resMult = this.resistances[config.attElmt];
    }

    const nonCrit = (baseValue * bonusMult + flat) * rxnMult * resMult;
    const cRate_ = Math.max(getBonus("cRate_", reaction), 0) / 100;
    const cDmg_ = getBonus("cDmg_", reaction) / 100;

    this.tracker?.recordCalcItem("RXN_CALC", reaction, {
      itemType: "attack",
      multFactors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
      totalFlat: flat,
      bonusMult,
      rxnMult,
      resMult,
      cDmg_,
      cRate_,
    });

    return {
      type: "attack",
      nonCrit,
      crit: cDmg_ ? nonCrit * (1 + cDmg_) : 0,
      average: cRate_ ? nonCrit * (1 + cDmg_ * cRate_) : nonCrit,
      attPatt: "none",
      attElmt,
      reaction: null,
    };
  };
}
