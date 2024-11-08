import type { CalcSetup, Target } from "@Src/types";
import type { TrackerControl } from "../controls";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import getNormalAttacksConfig from "../calculation/getNormalAttacksConfig";
import getAttackPatternConfig from "../calculation/getAttackPatternConfig";
import getCalculationStats from "../calculation/getCalculationStats";
import getResistances from "../calculation/getResistances";
import getCalcItemCalculator from "../calculation/getCalcItemCalculator";
import getFinalResult from "../calculation/getFinalResult";

export const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
  // console.time();
  const { char, weapon, party, elmtModCtrls, customInfusion } = setup;

  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppWeapon.get(weapon.code)!;
  const partyData = $AppCharacter.getPartyData(party);

  const calcInfo = {
    char,
    appChar,
    appWeapon,
    partyData,
  };

  const { artAttr, attBonusesCtrl, totalAttr } = getCalculationStats(setup, calcInfo, tracker);

  const resistances = getResistances(setup, calcInfo, target, tracker);

  const NAsConfig = getNormalAttacksConfig(setup.selfBuffCtrls, calcInfo);

  const configAttackPattern = getAttackPatternConfig({
    appChar,
    NAsConfig,
    customInfusion,
    totalAttr,
    attBonusesCtrl,
  });

  const calculateCalcItem = getCalcItemCalculator(char.level, target.level, totalAttr, resistances);

  const finalResult = getFinalResult({
    char,
    weapon,
    appChar,
    appWeapon,
    partyData,
    totalAttr,
    attBonusesCtrl,
    elmtModCtrls,
    resistances,
    tracker,
    configAttackPattern,
    calculateCalcItem,
  });
  // console.timeEnd();

  return {
    totalAttr,
    artAttr,
    attBonus: attBonusesCtrl.serialize(),
    finalResult,
  };
};
