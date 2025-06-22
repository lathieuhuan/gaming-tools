import type { CalcSetup, Target } from "@Src/types";
import type { CalculationFinalResult } from "../types";

import { getSetupEntitiesData } from "@Src/utils/getSetupEntitiesData";
import { ATTACK_PATTERNS, LUNAR_REACTIONS, TRANSFORMATIVE_REACTIONS } from "../constants";

import { InputProcessor, TrackerControl } from "../input-processor";
import { ResultCalculator } from "../result-calculator";

export const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
  // console.time();
  const data = getSetupEntitiesData(setup);
  const processor = new InputProcessor(setup, data, tracker);

  const { characterData } = processor;
  const { artAttr, totalAttr, attkBonusesArchive } = processor.getCalculationStats();
  const attackAlterer = processor.getAttackAlterer();
  const resistances = processor.getResistances(target);

  const resultCalculator = new ResultCalculator(
    target.level,
    characterData,
    totalAttr,
    attkBonusesArchive,
    attackAlterer,
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
        setup.customInfusion.element
      );
    }
  });

  // Lunar Reaction

  const lunarReactionCalculator = resultCalculator.genLunarReactionCalculator();

  for (const reaction of LUNAR_REACTIONS) {
    finalResult.RXN_CALC[reaction] = lunarReactionCalculator.calculate(reaction, setup.elmtModCtrls);
  }

  // Transformative Reaction

  const reactionCalculator = resultCalculator.genReactionCalculator();

  for (const reaction of TRANSFORMATIVE_REACTIONS) {
    finalResult.RXN_CALC[reaction] = reactionCalculator.calculate(reaction, setup.elmtModCtrls);
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
      bonusMult: 1,
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
