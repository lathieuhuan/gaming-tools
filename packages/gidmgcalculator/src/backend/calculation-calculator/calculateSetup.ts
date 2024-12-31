import type { CalcSetup, Target } from "@Src/types";
import type { CalculationFinalResult } from "../types";

import { GeneralCalc } from "../common-utils";
import { ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS } from "../constants";
import { TRANSFORMATIVE_REACTION_INFO } from "../constants/internal";
import { TrackerControl } from "../controls";

import { getDataOfSetupEntities } from "../calculation-utils/getDataOfSetupEntities";
import { CalcItemCalculator } from "../calculation/calc-item-calculator";
import { InputProcessor } from "../calculation/input-processor";

export const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
  // console.time();
  const { char, weapon, elmtModCtrls } = setup;
  const data = getDataOfSetupEntities(setup);
  const appWeapon = data.appWeapons[weapon.code];

  const processor = new InputProcessor(setup, data, tracker);

  const { characterRecord } = processor;
  const { artAttr, totalAttr, attkBonusesArchive } = processor.getCalculationStats();
  const NAsConfig = processor.getNormalAttacksConfig();
  const resistances = processor.getResistances(target);

  const calcItemCalculator = new CalcItemCalculator(
    target.level,
    characterRecord,
    NAsConfig,
    setup.customInfusion,
    totalAttr,
    attkBonusesArchive,
    resistances,
    tracker
  );

  const finalResult: CalculationFinalResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN_CALC: {},
    WP_CALC: {},
  };

  ATTACK_PATTERNS.forEach((ATT_PATT) => {
    const calculator = calcItemCalculator.genAttPattCalculator(ATT_PATT);

    for (const calcItem of characterRecord.appCharacter.calcList[ATT_PATT]) {
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
      reaction: null,
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
    const baseDmg = (totalAttr[basedOn] * mult) / 100;

    finalResult.WP_CALC[name] = calcItemCalculator.genCalculator(type, "none", "phys").calculate(baseDmg, null, record);

    tracker?.recordCalcItem("WP_CALC", name, record);
  });

  // console.timeEnd();

  return {
    characterRecord,
    totalAttr,
    artAttr,
    attkBonuses: attkBonusesArchive.serialize(),
    finalResult,
  };
};
