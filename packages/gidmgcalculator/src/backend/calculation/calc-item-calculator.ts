import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackElement,
  AttackBonusKey,
  CalcItemType,
  Level,
  ResistanceReduction,
} from "@Src/backend/types";
import type { CalculationFinalResultItem, TotalAttribute } from "./calculation.types";
import type { CalcItemRecord } from "./controls";

import { applyToOneOrMany, toMult } from "@Src/utils";
import { GeneralCalc } from "./utils";

type CalculateArgs = {
  calcType: CalcItemType;
  attPatt: ActualAttackPattern;
  attElmt: AttackElement;
  base: number | number[];
  rxnMult: number;
  record: CalcItemRecord;
  getBonus?: (key: AttackBonusKey) => number;
};

export default class CalcItemCalculator {
  private charLv: Level;
  private targetLv: number;
  private totalAttr: TotalAttribute;
  private resistances: ResistanceReduction;

  constructor(charLv: Level, targetLv: number, totalAttr: TotalAttribute, resistances: ResistanceReduction) {
    this.charLv = charLv;
    this.targetLv = targetLv;
    this.totalAttr = totalAttr;
    this.resistances = resistances;
  }

  static genEmptyResult(
    type: CalcItemType,
    attPatt: ActualAttackPattern,
    attElmt: ActualAttackElement
  ): CalculationFinalResultItem {
    return type === "attack"
      ? {
          type,
          nonCrit: 0,
          crit: 0,
          average: 0,
          attPatt,
          attElmt,
        }
      : {
          type,
          nonCrit: 0,
          crit: 0,
          average: 0,
        };
  }

  //
  calculate = ({
    base,
    attPatt,
    attElmt,
    rxnMult,
    calcType,
    record,
    getBonus = () => 0,
  }: CalculateArgs): CalculationFinalResultItem => {
    const { charLv, targetLv, totalAttr, resistances } = this;

    if (base === 0) {
      return CalcItemCalculator.genEmptyResult(calcType, attPatt, attElmt);
    }

    if (calcType === "attack") {
      let flat = getBonus("flat");
      let normalMult = getBonus("pct_") + totalAttr[attElmt];
      let specialMult = getBonus("multPlus_");

      normalMult = toMult(normalMult);
      specialMult = toMult(specialMult);

      // CALCULATE DEFENSE MULTIPLIER
      let defMult = 1;
      const charPart = GeneralCalc.getBareLv(charLv) + 100;
      const defReduction = 1 - resistances.def / 100;

      defMult = 1 - getBonus("defIgn_") / 100;
      defMult = charPart / (defReduction * defMult * (targetLv + 100) + charPart);

      // CALCULATE RESISTANCE MULTIPLIER
      const resMult = resistances[attElmt];

      // CALCULATE CRITS
      const totalCrit = (type: "cRate_" | "cDmg_") => {
        return getBonus(type) + totalAttr[type];
      };
      const cRate_ = Math.min(Math.max(totalCrit("cRate_"), 0), 100) / 100;
      const cDmg_ = totalCrit("cDmg_") / 100;

      base = applyToOneOrMany(base, (n) => (n + flat) * normalMult * specialMult * rxnMult * defMult * resMult);

      record.totalFlat = flat;
      record.normalMult = normalMult;
      record.specialMult = specialMult;
      record.rxnMult = rxnMult;
      record.defMult = defMult;
      record.resMult = resMult;
      record.cRate_ = cRate_;
      record.cDmg_ = cDmg_;

      return {
        type: calcType,
        nonCrit: base,
        crit: applyToOneOrMany(base, (n) => n * (1 + cDmg_)),
        average: applyToOneOrMany(base, (n) => n * (1 + cRate_ * cDmg_)),
        attPatt,
        attElmt,
      };
    }

    if (!Array.isArray(base)) {
      let flat = 0;
      let normalMult = 1;

      switch (calcType) {
        case "healing":
          flat = getBonus("flat") ?? 0;
          normalMult += totalAttr.healB_ / 100;
          break;
        case "shield":
          normalMult += getBonus("pct_") / 100;
          break;
      }
      base += flat;
      record.totalFlat = (record.totalFlat || 0) + flat;

      if (normalMult !== 1) {
        base *= normalMult;
        record.normalMult = normalMult;
      }
      if (calcType === "healing") {
        base *= 1 + totalAttr.inHealB_ / 100;
      }
      return {
        type: calcType,
        nonCrit: base,
        crit: 0,
        average: base,
      };
    }

    return CalcItemCalculator.genEmptyResult(calcType, attPatt, attElmt);
  };
}

export type CalculateCalcItem = CalcItemCalculator["calculate"];
