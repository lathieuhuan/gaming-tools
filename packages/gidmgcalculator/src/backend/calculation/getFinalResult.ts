import { AttackBonusControl, TotalAttribute, TrackerControl } from "@Src/backend/controls";
import type { AppCharacter, AppWeapon, AttackElement, ResistanceReduction } from "@Src/backend/types";
import type { CalcCharacter, CalcWeapon, PartyData } from "@Src/types";
import type { ConfigAttackPattern } from "./attack-pattern-conf";
import type { CalculateCalcItem } from "./calc-item-calculator";
import type { CalculationFinalResult } from "./calculation.types";

import { ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS } from "@Src/backend/constants";
import { TRANSFORMATIVE_REACTION_INFO } from "@Src/backend/constants/internal";

import { toArray } from "@Src/utils";
import { CharacterCalc, GeneralCalc } from "@Src/backend/utils";
import CalcItemCalculator from "./calc-item-calculator";

type GetFinalResultArgs = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  totalAttr: TotalAttribute;
  attBonus: AttackBonusControl;
  resistances: ResistanceReduction;
  tracker?: TrackerControl;
  configAttackPattern: ConfigAttackPattern;
  calculateCalcItem: CalculateCalcItem;
};

export default function getFinalResult({
  char,
  weapon,
  appChar,
  appWeapon,
  partyData,
  totalAttr,
  attBonus,
  resistances,
  tracker,
  configAttackPattern,
  calculateCalcItem,
}: GetFinalResultArgs) {
  const finalResult: CalculationFinalResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN_CALC: {},
    WP_CALC: {},
  };

  ATTACK_PATTERNS.forEach((ATT_PATT) => {
    const { resultKey, disabled, configCalcItem, configFlatFactor } = configAttackPattern(ATT_PATT);
    const level = CharacterCalc.getFinalTalentLv({ appChar, talentType: resultKey, char, partyData });

    for (const calcItem of appChar.calcList[ATT_PATT]) {
      const { type, attPatt, attElmt, rxnMult, extraMult, record, getTotalBonus, configMultFactor } =
        configCalcItem(calcItem);

      let bases: number[] = [];

      // CALCULATE BASE DAMAGE
      for (const factor of toArray(calcItem.multFactors)) {
        const { root, scale, basedOn } = configMultFactor(factor);
        const finalMult = root * CharacterCalc.getTalentMult(scale, level) + extraMult;

        record.multFactors.push({
          value: totalAttr[basedOn],
          desc: basedOn,
          talentMult: finalMult,
        });
        bases.push((totalAttr[basedOn] * finalMult) / 100);
      }

      if (calcItem.joinMultFactors) {
        bases = [bases.reduce((accumulator, base) => accumulator + base, 0)];
      }

      if (calcItem.flatFactor) {
        const { root, scale } = configFlatFactor(calcItem.flatFactor);
        const flatBonus = root * CharacterCalc.getTalentMult(scale, level);

        bases = bases.map((base) => base + flatBonus);
        record.totalFlat = flatBonus;
      }

      // TALENT DMG
      if (disabled && type === "attack") {
        finalResult[resultKey][calcItem.name] = CalcItemCalculator.genEmptyResult(type, attPatt, attElmt);
      } else {
        finalResult[resultKey][calcItem.name] = calculateCalcItem({
          base: bases.length > 1 ? bases : bases[0],
          attPatt,
          attElmt,
          calcType: type,
          rxnMult,
          record,
          getBonus: getTotalBonus,
        });
      }

      tracker?.recordCalcItem(resultKey, calcItem.name, record);
    }
  });

  const baseRxnDmg = GeneralCalc.getBaseRxnDmg(char.level);

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    const { mult, dmgType } = TRANSFORMATIVE_REACTION_INFO[rxn];
    const normalMult = 1 + attBonus.getBare("pct_", rxn) / 100;
    const resMult = dmgType !== "absorb" ? resistances[dmgType] : 1;
    const baseValue = baseRxnDmg * mult;
    const nonCrit = baseValue * normalMult * resMult;
    const cDmg_ = attBonus.getBare("cDmg_", rxn) / 100;
    const cRate_ = Math.max(attBonus.getBare("cRate_", rxn), 0) / 100;

    finalResult.RXN_CALC[rxn] = {
      type: "attack",
      nonCrit,
      crit: cDmg_ ? nonCrit * (1 + cDmg_) : 0,
      average: cRate_ ? nonCrit * (1 + cDmg_ * cRate_) : nonCrit,
      attPatt: "none",
      attElmt: dmgType,
    };

    tracker?.recordCalcItem("RXN_CALC", rxn, {
      itemType: "attack",
      multFactors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
      normalMult,
      resMult,
      cDmg_,
      cRate_,
    });
  }

  appWeapon.calcItems?.forEach((calcItem) => {
    const { name, type = "attack", value, incre = value / 3, baseOn = "atk" } = calcItem;
    const mult = value + incre * weapon.refi;
    const record = TrackerControl.initCalcItemRecord({
      itemType: type,
      multFactors: [
        {
          value: totalAttr[baseOn],
          desc: baseOn,
          talentMult: mult,
        },
      ],
      normalMult: 1,
    });
    const attElmt: AttackElement = "phys";

    finalResult.WP_CALC[name] = calculateCalcItem({
      calcType: type,
      attPatt: "none",
      attElmt,
      base: (totalAttr[baseOn] * mult) / 100,
      record,
      rxnMult: 1,
      getBonus: (key) => attBonus.get(key, attElmt),
    });

    tracker?.recordCalcItem("WP_CALC", name, record);
  });

  return finalResult;
}
