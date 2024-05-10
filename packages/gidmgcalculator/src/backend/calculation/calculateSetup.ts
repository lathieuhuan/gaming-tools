import type { CalcSetup, Target } from "@Src/types";
import type { TrackerControl } from "./controls";

import { $AppCharacter, $AppData } from "@Src/services";
import getCalculationStats from "./getCalculationStats";
import getFinalResult from "./getFinalResult";
import getResistances from "./getResistances";
import AttackPatternConf from "./attack-pattern-conf";
import CalcItemCalculator from "./calc-item-calculator";

export const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
  // console.time();
  const {
    char,
    weapon,
    artifacts,
    party,
    selfBuffCtrls,
    selfDebuffCtrls,
    wpBuffCtrls,
    artBuffCtrls,
    artDebuffCtrls,
    elmtModCtrls,
    customBuffCtrls,
    customDebuffCtrls,
    customInfusion,
  } = setup;

  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppData.getWeapon(weapon.code)!;
  const partyData = $AppCharacter.getPartyData(party);

  const { artAttr, bonusCtrl, ...rest } = getCalculationStats({
    char,
    weapon,
    artifacts,
    party,
    appChar,
    appWeapon,
    partyData,
    selfBuffCtrls,
    wpBuffCtrls,
    artBuffCtrls,
    elmtModCtrls,
    customBuffCtrls,
    customInfusion,
    tracker,
  });

  const resistances = getResistances({
    char,
    appChar,
    party,
    partyData,
    customDebuffCtrls,
    elmtModCtrls,
    selfDebuffCtrls,
    artDebuffCtrls,
    target,
    tracker,
  });

  const configAttackPattern = AttackPatternConf({
    char,
    appChar,
    partyData,
    selfBuffCtrls,
    elmtModCtrls,
    customInfusion,
    bonusCtrl,
  });

  const calcItemCalculator = new CalcItemCalculator(char.level, target.level, rest.totalAttr, resistances);

  const finalResult = getFinalResult({
    char,
    weapon,
    appChar,
    appWeapon,
    partyData,
    bonusCtrl,
    resistances,
    tracker,
    configAttackPattern,
    calculateCalcItem: calcItemCalculator.calculate,
    ...rest,
  });
  // console.timeEnd();

  return {
    totalAttr: rest.totalAttr,
    artAttr,
    rxnBonus: bonusCtrl.serialize("rxnBonus"),
    attBonus: bonusCtrl.serialize("attBonus"),
    finalResult,
  };
};
