import type { CalcSetup, Target } from "@Src/types";
import type { TrackerControl } from "../controls";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { AttackPatternConf, CalcItemCalculator, getNormalsConfig } from "../calculation";
import getCalculationStats from "./getCalculationStats";
import getFinalResult from "./getFinalResult";
import getResistances from "./getResistances";

export const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
  // console.time();
  const { char, weapon, party, elmtModCtrls, customInfusion } = setup;

  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppWeapon.get(weapon.code)!;
  const partyData = $AppCharacter.getPartyData(party);

  const { artAttr, attBonus, totalAttr } = getCalculationStats(
    setup,
    {
      appChar,
      appWeapon,
      partyData,
    },
    tracker
  );

  const resistances = getResistances(
    setup,
    {
      appChar,
      partyData,
    },
    target,
    tracker
  );

  const normalsConfig = getNormalsConfig(
    {
      char,
      appChar,
      partyData,
    },
    setup.selfBuffCtrls
  );

  const configAttackPattern = AttackPatternConf({
    appChar,
    normalsConfig,
    customInfusion,
    totalAttr,
    attBonus,
  });

  const calculateCalcItem = CalcItemCalculator(char.level, target.level, totalAttr, resistances);

  const finalResult = getFinalResult({
    char,
    weapon,
    appChar,
    appWeapon,
    partyData,
    totalAttr,
    attBonus,
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
    attBonus: attBonus.serialize(),
    finalResult,
  };
};
