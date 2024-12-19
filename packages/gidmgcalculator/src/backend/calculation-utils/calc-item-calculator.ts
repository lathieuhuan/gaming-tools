import type {
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackPattern,
  AttackReaction,
  CalcItem,
  CalcItemCore,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CalcItemType,
  CalculationFinalResultItem,
  CalculationInfo,
  NormalAttacksConfig,
  ResistanceReduction,
  TotalAttribute,
} from "@Src/backend/types";
import type { ElementModCtrl, Infusion } from "@Src/types";

import { toMult } from "@Src/utils";
import Array_ from "@Src/utils/array-utils";
import { CharacterCalc, GeneralCalc } from "@Src/backend/common-utils";
import { AttackBonusesArchive, CalcItemRecord, TrackerControl } from "@Src/backend/controls";

type InternalElmtModCtrls = Pick<ElementModCtrl, "reaction" | "infuse_reaction" | "absorption">;

export class CalcItemCalculator {
  constructor(
    private targetLv: number,
    private calcInfo: CalculationInfo,
    private NAsConfig: NormalAttacksConfig,
    private customInfusion: Infusion,
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    private resistances: ResistanceReduction,
    private tracker?: TrackerControl
  ) {}

  genCalculator = (
    itemType: CalcItemType,
    attPatt: ActualAttackPattern,
    attElmt: AttackElement,
    itemId?: CalcItemCore["id"]
  ) => {
    const {
      calcInfo: { char },
      targetLv,
      totalAttr,
      attkBonusesArchive,
      resistances,
    } = this;

    function genEmptyResult() {
      return itemType === "attack"
        ? {
            type: itemType,
            nonCrit: 0,
            crit: 0,
            average: 0,
            attPatt,
            attElmt,
            reaction: null,
          }
        : {
            type: itemType,
            nonCrit: 0,
            crit: 0,
            average: 0,
          };
    }

    function getBonus(key: AttackBonusKey) {
      const finalAttPatt = attPatt === "none" ? undefined : attPatt;

      if (itemType === "attack") {
        const mixedType = finalAttPatt ? (`${finalAttPatt}.${attElmt}` as const) : undefined;
        return attkBonusesArchive.get(key, finalAttPatt, attElmt, mixedType, itemId);
      }
      return attkBonusesArchive.getBare(key, finalAttPatt, itemId);
    }

    function calculate(
      base: number | number[],
      reaction: AttackReaction,
      record: CalcItemRecord
    ): CalculationFinalResultItem {
      if (base === 0) {
        return genEmptyResult();
      }

      if (itemType === "attack") {
        let flat = getBonus("flat");
        let normalMult = getBonus("pct_") + totalAttr[attElmt];
        let specialMult = getBonus("multPlus_");

        normalMult = toMult(normalMult);
        specialMult = toMult(specialMult);

        // CALCULATE REACTION MULTIPLIER
        let rxnMult = 1;

        // deal elemental dmg and want amplifying reaction
        if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
          rxnMult = GeneralCalc.getAmplifyingMultiplier(
            reaction,
            attElmt,
            attkBonusesArchive.getBare("pct_", reaction)
          );
        }

        // CALCULATE DEFENSE MULTIPLIER
        let defMult = 1;
        const charPart = GeneralCalc.getBareLv(char.level) + 100;
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

        base = Array_.applyToItem(base, (n) => (n + flat) * normalMult * specialMult * rxnMult * defMult * resMult);

        record.totalFlat = flat;
        record.normalMult = normalMult;
        record.specialMult = specialMult;
        record.rxnMult = rxnMult;
        record.defMult = defMult;
        record.resMult = resMult;
        record.cRate_ = cRate_;
        record.cDmg_ = cDmg_;

        return {
          type: itemType,
          nonCrit: base,
          crit: Array_.applyToItem(base, (n) => n * (1 + cDmg_)),
          average: Array_.applyToItem(base, (n) => n * (1 + cRate_ * cDmg_)),
          attPatt,
          attElmt,
          reaction,
        };
      }

      if (!Array.isArray(base)) {
        let flat = 0;
        let normalMult = 1;

        switch (itemType) {
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
        if (itemType === "healing") {
          base *= 1 + totalAttr.inHealB_ / 100;
        }
        return {
          type: itemType,
          nonCrit: base,
          crit: 0,
          average: base,
        };
      }

      return genEmptyResult();
    }

    return {
      genEmptyResult,
      getBonus,
      calculate,
    };
  };

  genAttPattCalculator = (patternKey: AttackPattern) => {
    const { NAsConfig, totalAttr, attkBonusesArchive, customInfusion } = this;
    const { appChar } = this.calcInfo;

    const default_ = CharacterCalc.getTalentDefaultInfo(patternKey, appChar);
    const resultKey = default_.resultKey;
    const disabled = NAsConfig[patternKey]?.disabled === true;
    const level = CharacterCalc.getFinalTalentLv({ ...this.calcInfo, talentType: resultKey });

    const configFlatFactor = (factor: CalcItemFlatFactor) => {
      const { root, scale = default_.flatFactorScale } = typeof factor === "number" ? { root: factor } : factor;
      return {
        root,
        scale,
      };
    };

    const configMultFactor = (factor: CalcItemMultFactor) => {
      const {
        root,
        scale = default_.scale,
        basedOn = default_.basedOn,
      } = typeof factor === "number" ? { root: factor } : factor;

      return {
        root,
        scale,
        basedOn,
      };
    };

    const calculate = (item: CalcItem, elmtModCtrls: InternalElmtModCtrls): CalculationFinalResultItem => {
      const { type = "attack" } = item;

      // ========== ATTACK PATTERN, ATTACK ELEMENT, REACTION ==========

      const attPatt = item.attPatt ?? NAsConfig[patternKey]?.attPatt ?? default_.attPatt;
      let attElmt: AttackElement;
      let reaction = elmtModCtrls.reaction;

      if (item.attElmt) {
        if (item.attElmt === "absorb") {
          // this attack can absorb element (anemo abilities) but user may or may not activate absorption
          attElmt = elmtModCtrls.absorption || appChar.vision;
        } else {
          attElmt = item.attElmt;
        }
      } else if (appChar.weaponType === "catalyst" || item.subAttPatt === "FCA" || resultKey !== "NAs") {
        attElmt = appChar.vision;
      } else if (resultKey === "NAs" && customInfusion.element !== "phys") {
        attElmt = customInfusion.element;
        /**
         * when the customInfusion.element is the same as appChar.vision (e.g. Pyro)
         * elmtModCtrls.infuse_reaction will be null, because the reaction of NAs will be the same as ES and EB,
         * so we use elmtModCtrls.reaction instead
         */
        reaction = elmtModCtrls.infuse_reaction ?? elmtModCtrls.reaction;
      } else {
        attElmt = NAsConfig[patternKey]?.attElmt ?? "phys";
      }

      // ========== FINAL RESULT ==========

      const record = TrackerControl.initCalcItemRecord({
        itemType: type,
        multFactors: [],
        normalMult: 1,
        exclusives: attkBonusesArchive.getExclusiveBonuses(item),
      });
      const calculator = this.genCalculator(type, attPatt, attElmt, item.id);

      let result: CalculationFinalResultItem;

      if (disabled && type === "attack") {
        result = calculator.genEmptyResult();
      } //
      else {
        let bases: number[] = [];

        // CALCULATE BASE DAMAGE
        for (const factor of Array_.toArray(item.multFactors)) {
          const { root, scale, basedOn } = configMultFactor(factor);
          const finalMult = root * CharacterCalc.getTalentMult(scale, level) + calculator.getBonus("mult_");

          record.multFactors.push({
            value: totalAttr[basedOn],
            desc: basedOn,
            talentMult: finalMult,
          });
          bases.push((totalAttr[basedOn] * finalMult) / 100);
        }

        if (item.joinMultFactors) {
          bases = [bases.reduce((accumulator, base) => accumulator + base, 0)];
        }

        if (item.flatFactor) {
          const { root, scale } = configFlatFactor(item.flatFactor);
          const flatBonus = root * CharacterCalc.getTalentMult(scale, level);

          bases = bases.map((base) => base + flatBonus);
          record.totalFlat = flatBonus;
        }

        const baseDmg = bases.length > 1 ? bases : bases[0];

        // TALENT DMG
        result = calculator.calculate(baseDmg, reaction, record);
      }

      this.tracker?.recordCalcItem(resultKey, item.name, record);

      return result;
    };

    return {
      resultKey,
      disabled,
      calculate,
    };
  };
}
