import type {
  ActualAttackPattern,
  AttackElement,
  AttackElementBonus,
  AttackPatternBonus,
  CalcItemType,
  Level,
  ResistanceReduction,
} from "@Src/backend/types";
import type { CalculationFinalResultItem, TotalAttribute } from "../calculation.types";
import type { CalcItemRecord, ProcessedItemBonus } from "../controls";

import { applyToOneOrMany, toMult } from "@Src/utils";
import { GeneralCalc } from "../utils";

type CalculateArgs = {
  calcType?: CalcItemType;
  attPatt: ActualAttackPattern;
  attElmt: AttackElement;
  base: number | number[];
  rxnMult: number;
  calcItemBonus?: ProcessedItemBonus;
  record: CalcItemRecord;
  // absorbedElmt?: ElementType;
};

export class CalcItemCalc {
  private charLv: Level;
  private targetLv: number;
  private totalAttr: TotalAttribute;
  private attPattBonus: AttackPatternBonus;
  private attElmtBonus: AttackElementBonus;
  private resistReduct: ResistanceReduction;

  constructor(
    charLv: Level,
    targetLv: number,
    totalAttr: TotalAttribute,
    attPattBonus: AttackPatternBonus,
    attElmtBonus: AttackElementBonus,
    resistReduct: ResistanceReduction
  ) {
    this.charLv = charLv;
    this.targetLv = targetLv;
    this.totalAttr = totalAttr;
    this.attPattBonus = attPattBonus;
    this.attElmtBonus = attElmtBonus;
    this.resistReduct = resistReduct;
  }

  calculate({
    base,
    attPatt,
    attElmt,
    rxnMult,
    calcType,
    calcItemBonus = {},
    record,
  }: CalculateArgs): CalculationFinalResultItem {
    const { totalAttr, attPattBonus, attElmtBonus, resistReduct } = this;

    if (base !== 0 && !calcType) {
      let flat = (calcItemBonus.flat ?? 0) + attPattBonus.all.flat + attElmtBonus[attElmt].flat;
      // CALCULATE DAMAGE BONUS MULTIPLIERS
      let normalMult = (calcItemBonus.pct_ ?? 0) + attPattBonus.all.pct_ + totalAttr[attElmt];
      let specialMult = (calcItemBonus.multPlus_ ?? 0) + attPattBonus.all.multPlus_;

      if (attPatt !== "none") {
        flat += attPattBonus[attPatt].flat;
        normalMult += attPattBonus[attPatt].pct_;
        specialMult += attPattBonus[attPatt].multPlus_;
      }
      normalMult = toMult(normalMult);
      specialMult = toMult(specialMult);

      // CALCULATE DEFENSE MULTIPLIER
      let defMult = 1;
      const charPart = GeneralCalc.getBareLv(this.charLv) + 100;
      const defReduction = 1 - resistReduct.def / 100;

      if (attPatt !== "none") {
        defMult = 1 - (attPattBonus[attPatt].defIgn_ + attPattBonus.all.defIgn_) / 100;
      }
      defMult = charPart / (defReduction * defMult * (this.targetLv + 100) + charPart);

      // CALCULATE RESISTANCE MULTIPLIER
      const resMult = resistReduct[attElmt];

      // CALCULATE CRITS
      const totalCrit = (type: "cRate_" | "cDmg_") => {
        return (
          totalAttr[type] +
          (calcItemBonus[type] ?? 0) +
          attPattBonus.all[type] +
          (attPatt !== "none" ? attPattBonus[attPatt][type] : 0) +
          attElmtBonus[attElmt][type]
        );
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
        nonCrit: base,
        crit: applyToOneOrMany(base, (n) => n * (1 + cDmg_)),
        average: applyToOneOrMany(base, (n) => n * (1 + cRate_ * cDmg_)),
        attElmt,
      };
    }

    if (!Array.isArray(base)) {
      let flat = 0;
      let normalMult = 1;

      switch (calcType) {
        case "healing":
          flat = calcItemBonus.flat ?? 0;
          normalMult += totalAttr.healB_ / 100;
          break;
        case "shield":
          normalMult += (calcItemBonus.pct_ ?? 0) / 100;
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
      return { nonCrit: base, crit: 0, average: base };
    }

    return { nonCrit: 0, crit: 0, average: 0 };
  }
}
