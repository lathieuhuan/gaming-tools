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

  calculate = (reaction: TransformativeReaction): CalculationFinalResultAttackItem => {
    const { mult, attElmt } = TRANSFORMATIVE_REACTION_CONFIG[reaction];
    const flat = this.getBonus("flat", reaction);
    const baseValue = this.baseDmg * mult + flat;
    const normalMult = 1 + this.getBonus("pct_", reaction) / 100;
    const resMult = attElmt !== "absorb" ? this.resistances[attElmt] : 1;
    const nonCrit = baseValue * normalMult * resMult;
    const cDmg_ = this.getBonus("cDmg_", reaction) / 100;
    const cRate_ = Math.max(this.getBonus("cRate_", reaction), 0) / 100;

    this.tracker?.recordCalcItem("RXN_CALC", reaction, {
      itemType: "attack",
      multFactors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
      totalFlat: flat,
      normalMult,
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
