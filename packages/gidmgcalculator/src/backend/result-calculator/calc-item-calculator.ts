import type {
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  CalcItemType,
  CalculationFinalResultItem,
  ResistanceReduction,
  TalentCalcItemBonusId,
  TotalAttribute,
} from "../types";
import type { AttackBonusesArchive, CalcItemRecord } from "../input-processor";

import { toMult } from "@Src/utils";
import Array_ from "@Src/utils/array-utils";
import { GeneralCalc } from "../common-utils";

export class CalcItemCalculator {
  constructor(
    private targetLv: number,
    private characterBareLv: number,
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    private resistances: ResistanceReduction
  ) {}

  getBonus: typeof this.attkBonusesArchive.getBare = (...params) => {
    return this.attkBonusesArchive.getBare(...params);
  };

  getRxnMult = (attElmt: AttackElement, reaction?: AttackReaction) => {
    if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
      // deal elemental dmg and want amplifying reaction
      return GeneralCalc.getAmplifyingMultiplier(reaction, attElmt, this.attkBonusesArchive.getBare("pct_", reaction));
    }
    return 1;
  };

  genAttackCalculator = (attPatt: ActualAttackPattern, attElmt: AttackElement, itemId?: TalentCalcItemBonusId) => {
    const { totalAttr, attkBonusesArchive, resistances } = this;

    const emptyResult: CalculationFinalResultItem = {
      type: "attack",
      nonCrit: 0,
      crit: 0,
      average: 0,
      attPatt,
      attElmt,
      reaction: null,
    };

    const getBonus = (key: AttackBonusKey) => {
      const finalAttPatt = attPatt === "none" ? undefined : attPatt;
      const mixedType = finalAttPatt ? (`${finalAttPatt}.${attElmt}` as const) : undefined;
      return attkBonusesArchive.get(key, finalAttPatt, attElmt, mixedType, itemId);
    };

    const calculate = (
      base: number | number[],
      reaction: AttackReaction,
      record: CalcItemRecord
    ): CalculationFinalResultItem => {
      //
      if (base === 0) {
        return emptyResult;
      }

      let flat = getBonus("flat");
      let bonusMult = getBonus("pct_") + totalAttr[attElmt];
      let baseMult = getBonus("multPlus_");

      bonusMult = toMult(bonusMult);
      baseMult = toMult(baseMult);

      // CALCULATE REACTION MULTIPLIER
      const rxnMult = this.getRxnMult(attElmt, reaction);

      // CALCULATE DEFENSE MULTIPLIER
      let defMult = 1;
      const charPart = this.characterBareLv + 100;
      const defReduction = 1 - resistances.def / 100;

      defMult = 1 - getBonus("defIgn_") / 100;
      defMult = charPart / (defReduction * defMult * (this.targetLv + 100) + charPart);

      // CALCULATE RESISTANCE MULTIPLIER
      const resMult = resistances[attElmt];

      // CALCULATE CRITS
      const totalCrit = (type: "cRate_" | "cDmg_") => {
        return getBonus(type) + totalAttr[type];
      };
      const cRate_ = Math.min(Math.max(totalCrit("cRate_"), 0), 100) / 100;
      const cDmg_ = totalCrit("cDmg_") / 100;

      base = Array_.applyToItem(base, (n) => (n * baseMult + flat) * bonusMult * rxnMult * defMult * resMult);

      record.baseMult = baseMult;
      record.totalFlat = flat;
      record.bonusMult = bonusMult;
      record.rxnMult = rxnMult;
      record.defMult = defMult;
      record.resMult = resMult;
      record.cRate_ = cRate_;
      record.cDmg_ = cDmg_;

      return {
        type: "attack",
        nonCrit: base,
        crit: Array_.applyToItem(base, (n) => n * (1 + cDmg_)),
        average: Array_.applyToItem(base, (n) => n * (1 + cRate_ * cDmg_)),
        attPatt,
        attElmt,
        reaction,
      };
    };

    return {
      emptyResult,
      getBonus,
      calculate,
    };
  };

  genOtherCalculator = (itemType: Exclude<CalcItemType, "attack">, itemId?: TalentCalcItemBonusId) => {
    const { totalAttr } = this;

    const calculate = (base: number | number[], record: CalcItemRecord): CalculationFinalResultItem => {
      //
      if (base === 0) {
        return {
          type: itemType,
          nonCrit: 0,
          crit: 0,
          average: 0,
        };
      }

      let flat = 0;
      let bonusMult = 1 + this.getBonus("pct_", itemId) / 100;

      switch (itemType) {
        case "healing":
          flat = this.getBonus("flat", itemId) ?? 0;
          bonusMult += totalAttr.healB_ / 100;
          break;
        case "shield":
          bonusMult += totalAttr.shieldS_ / 100;
          break;
      }

      base = Array_.applyToItem(base, (n) => n + flat);
      record.totalFlat = (record.totalFlat || 0) + flat;

      if (bonusMult !== 1) {
        base = Array_.applyToItem(base, (n) => n * bonusMult);
        record.bonusMult = bonusMult;
      }
      if (itemType === "healing") {
        base = Array_.applyToItem(base, (n) => n * (1 + totalAttr.inHealB_ / 100));
      }

      return {
        type: itemType,
        nonCrit: base,
        crit: 0,
        average: base,
      };
    };

    return {
      calculate,
    };
  };
}
