import type { CalcCharacter, CalcWeapon, ElementModCtrl } from "@Src/types";
import type { AttackBonusesArchive } from "../controls";
import type {
  AppCharacter,
  AppWeapon,
  AttackElement,
  CalculationFinalResult,
  ResistanceReduction,
  TotalAttribute,
} from "../types";
import type { CalcItemCalculator } from "./getCalcItemCalculator";

import { ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS } from "../constants";
import { TRANSFORMATIVE_REACTION_INFO } from "../constants/internal";
import { TrackerControl } from "../controls";
import { GeneralCalc } from "../common-utils";

type GetFinalResultArgs = {
  char: CalcCharacter;
  appChar: AppCharacter;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  totalAttr: TotalAttribute;
  attkBonusesArchive: AttackBonusesArchive;
  elmtModCtrls: ElementModCtrl;
  resistances: ResistanceReduction;
  calcItemCalculator: CalcItemCalculator;
  tracker?: TrackerControl;
};

export default function getFinalResult({
  char,
  weapon,
  appChar,
  appWeapon,
  totalAttr,
  attkBonusesArchive,
  elmtModCtrls,
  resistances,
  calcItemCalculator,
  tracker,
}: GetFinalResultArgs) {
  const finalResult: CalculationFinalResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN_CALC: {},
    WP_CALC: {},
  };

  ATTACK_PATTERNS.forEach((ATT_PATT) => {
    const calculator = calcItemCalculator.genAttPattCalculator(ATT_PATT);

    for (const calcItem of appChar.calcList[ATT_PATT]) {
      finalResult[calculator.resultKey][calcItem.name] = calculator.calculate(calcItem, elmtModCtrls);
    }
  });

  const baseRxnDmg = GeneralCalc.getBaseRxnDamage(char.level);

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    const { mult, dmgType } = TRANSFORMATIVE_REACTION_INFO[rxn];
    const normalMult = 1 + attkBonusesArchive.getBare("pct_", rxn) / 100;
    const resMult = dmgType !== "absorb" ? resistances[dmgType] : 1;
    const baseValue = baseRxnDmg * mult;
    const nonCrit = baseValue * normalMult * resMult;
    const cDmg_ = attkBonusesArchive.getBare("cDmg_", rxn) / 100;
    const cRate_ = Math.max(attkBonusesArchive.getBare("cRate_", rxn), 0) / 100;

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
    const { name, type = "attack", value, incre = value / 3, basedOn = "atk" } = calcItem;
    const mult = value + incre * weapon.refi;
    const record = TrackerControl.initCalcItemRecord({
      itemType: type,
      multFactors: [
        {
          value: totalAttr[basedOn],
          desc: basedOn,
          talentMult: mult,
        },
      ],
      normalMult: 1,
    });
    const attElmt: AttackElement = "phys";

    finalResult.WP_CALC[name] = calcItemCalculator.calculate({
      type,
      attPatt: "none",
      attElmt,
      base: (totalAttr[basedOn] * mult) / 100,
      record,
      rxnMult: 1,
      getBonus: (key) => attkBonusesArchive.get(key, attElmt),
    });

    tracker?.recordCalcItem("WP_CALC", name, record);
  });

  return finalResult;
}
