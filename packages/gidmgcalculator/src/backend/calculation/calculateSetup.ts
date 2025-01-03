import type { CalcSetup, Target } from "@Src/types";
import type { CalculationFinalResult } from "../types";

import { GeneralCalc } from "../common-utils";
import { ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS } from "../constants";
import { TRANSFORMATIVE_REACTION_CONFIG } from "../constants/internal";
import { TrackerControl } from "../controls";

import { getDataOfSetupEntities } from "../calculation-utils/getDataOfSetupEntities";
import { InputProcessor } from "./input-processor";
import { ResultCalculator } from "./result-calculator";

export const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
  // console.time();
  const data = getDataOfSetupEntities(setup);
  const processor = new InputProcessor(setup, data, tracker);

  const { characterData } = processor;
  const { artAttr, totalAttr, attkBonusesArchive } = processor.getCalculationStats();
  const NAsConfig = processor.getNormalAttacksConfig();
  const resistances = processor.getResistances(target);

  const resultCalculator = new ResultCalculator(
    target.level,
    characterData,
    NAsConfig,
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
    const calculator = resultCalculator.genTalentCalculator(ATT_PATT);

    for (const calcItem of characterData.appCharacter.calcList[ATT_PATT]) {
      finalResult[calculator.resultKey][calcItem.name] = calculator.calculateItem(
        calcItem,
        setup.elmtModCtrls,
        setup.customInfusion
      );
    }
  });

  const baseRxnDmg = GeneralCalc.getBaseRxnDamage(setup.char.level);

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    const { mult, attElmt } = TRANSFORMATIVE_REACTION_CONFIG[rxn];
    const normalMult = 1 + attkBonusesArchive.getBare("pct_", rxn) / 100;
    const resMult = attElmt !== "absorb" ? resistances[attElmt] : 1;
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
      attElmt,
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

  data.appWeapons[setup.weapon.code].calcItems?.forEach((calcItem) => {
    const { name, type = "attack", value, incre = value / 3, basedOn = "atk" } = calcItem;
    const mult = value + incre * setup.weapon.refi;
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
    const base = (totalAttr[basedOn] * mult) / 100;

    finalResult.WP_CALC[name] =
      type === "attack"
        ? resultCalculator.itemCalculator.genAttackCalculator("none", "phys").calculate(base, null, record)
        : resultCalculator.itemCalculator.genOtherCalculator(type).calculate(base, record);

    tracker?.recordCalcItem("WP_CALC", name, record);
  });

  // console.timeEnd();

  return {
    characterData,
    totalAttr,
    artAttr,
    attkBonuses: attkBonusesArchive.serialize(),
    finalResult,
  };
};
