import type { CalcSetup, Target } from "@Src/types";
import type { TrackerControl } from "../controls";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import getNormalAttacksConfig from "../calculation/getNormalAttacksConfig";
import getCalculationStats from "../calculation/getCalculationStats";
import getResistances from "../calculation/getResistances";
import getFinalResult from "../calculation/getFinalResult";
import getCalcItemCalculator from "../calculation/getCalcItemCalculator";

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

  const { artAttr, attkBonusesArchive, totalAttr } = getCalculationStats(setup, calcInfo, tracker);

  const resistances = getResistances(setup, calcInfo, target, tracker);

  const NAsConfig = getNormalAttacksConfig(setup.selfBuffCtrls, calcInfo);

  const calcItemCalculator = getCalcItemCalculator(
    target.level,
    calcInfo,
    NAsConfig,
    customInfusion,
    totalAttr,
    attkBonusesArchive,
    resistances,
    tracker
  );

  const finalResult = getFinalResult({
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
  });
  // console.timeEnd();

  return {
    totalAttr,
    artAttr,
    attkBonuses: attkBonusesArchive.serialize(),
    finalResult,
  };
};
