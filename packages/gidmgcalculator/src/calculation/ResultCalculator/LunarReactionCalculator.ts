import type { ElementModCtrl } from "@/types";
import type { TrackerControl } from "../TrackerControl";
import type { CalculationFinalResultAttackItem, Level, LunarReaction, ResistReduction, TotalAttribute } from "../types";
import type { CalcItemCalculator } from "./CalcItemCalculator";

import { toMult } from "@/utils";
import { GeneralCalc } from "../utils";
import { LUNAR_ATTACK_ELEMENT, LUNAR_REACTION_COEFFICIENT } from "../constants/internal";

export class LunarReactionCalculator {
  private baseDmg: number;

  constructor(
    characterLv: Level,
    private itemCalculator: CalcItemCalculator,
    private totalAttr: TotalAttribute,
    private resistances: ResistReduction,
    private tracker?: TrackerControl
  ) {
    this.baseDmg = GeneralCalc.getBaseRxnDamage(characterLv);
  }

  calculate = (reaction: LunarReaction, elmtModCtrl?: ElementModCtrl): CalculationFinalResultAttackItem => {
    const { totalAttr } = this;
    const { getBonus, getRxnMult } = this.itemCalculator;

    const coefficient = LUNAR_REACTION_COEFFICIENT[reaction];
    const baseValue = this.baseDmg * coefficient;
    const baseMult = toMult(getBonus("multPlus_", reaction));
    const bonusMult = 1 + getBonus("pct_", reaction) / 100;
    const flat = getBonus("flat", reaction);
    const attElmt = LUNAR_ATTACK_ELEMENT[reaction];
    const rxnMult = 1;
    let resMult = 1;

    resMult = this.resistances[attElmt];

    const nonCrit = (baseValue * baseMult * bonusMult + flat) * rxnMult * resMult;
    let cRate_ = getBonus("cRate_", reaction) + totalAttr.cRate_;
    cRate_ = Math.min(Math.max(cRate_, 0), 100) / 100;
    const cDmg_ = (getBonus("cDmg_", reaction) + totalAttr.cDmg_) / 100;

    this.tracker?.recordCalcItem("RXN_CALC", reaction, {
      itemType: "attack",
      factors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
      totalFlat: flat,
      baseMult,
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
