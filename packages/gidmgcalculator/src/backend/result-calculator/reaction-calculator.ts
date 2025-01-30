import type { ElementModCtrl } from "@Src/types";
import type { CalculationFinalResultAttackItem, Level, ResistanceReduction, TransformativeReaction } from "../types";
import type { TrackerControl } from "../input-processor";
import type { CalcItemCalculator } from "./calc-item-calculator";

import { TRANSFORMATIVE_REACTION_CONFIG } from "../constants/internal";
import { GeneralCalc } from "../common-utils";

export class ReactionCalculator {
  private baseDmg: number;
  private getBonus: CalcItemCalculator["getBonus"];

  constructor(
    characterLv: Level,
    itemCalculator: CalcItemCalculator,
    private resistances: ResistanceReduction,
    private tracker?: TrackerControl
  ) {
    this.baseDmg = GeneralCalc.getBaseRxnDamage(characterLv);
    this.getBonus = itemCalculator.getBonus;
  }

  calculate = (reaction: TransformativeReaction, elmtModCtrl?: ElementModCtrl): CalculationFinalResultAttackItem => {
    const config = TRANSFORMATIVE_REACTION_CONFIG[reaction];
    const flat = this.getBonus("flat", reaction);
    const baseValue = this.baseDmg * config.mult;
    const normalMult = 1 + this.getBonus("pct_", reaction) / 100;
    let rxnMult = 1;
    let resMult = 1;

    const attElmt = config.attElmt === "absorb" ? elmtModCtrl?.absorption : config.attElmt;

    if (attElmt) {
      resMult = this.resistances[attElmt];
    }

    const nonCrit = (baseValue * normalMult + flat) * rxnMult * resMult;
    const cRate_ = Math.max(this.getBonus("cRate_", reaction), 0) / 100;
    const cDmg_ = this.getBonus("cDmg_", reaction) / 100;

    this.tracker?.recordCalcItem("RXN_CALC", reaction, {
      itemType: "attack",
      multFactors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
      totalFlat: flat,
      normalMult,
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
      attElmt: config.attElmt,
      reaction: null,
    };
  };
}
