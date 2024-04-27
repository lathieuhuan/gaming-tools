import type { CalcSetup, Target } from "@Src/types";
import type { TrackerControl } from "./controls";

import { $AppCharacter, $AppData } from "@Src/services";
import getCalculationStats from "./getCalculationStats";

const calculateSetup = (setup: CalcSetup, target: Target, tracker?: TrackerControl) => {
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

  const { artAttr, calcInfusion, disabledNAs, ...rest } = getCalculationStats({
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
  const finalResult = getFinalResult({
    char,
    weapon,
    party,
    appChar,
    appWeapon,
    partyData,
    selfDebuffCtrls,
    artDebuffCtrls,
    disabledNAs,
    customDebuffCtrls,
    infusion: calcInfusion,
    elmtModCtrls,
    target,
    tracker,
    ...rest,
  });
  // console.timeEnd();
  return {
    totalAttr: rest.totalAttr,
    artAttr,
    rxnBonus: rest.rxnBonus,
    charStatus: rest.charStatus,
    infusedElement: calcInfusion.element,
    infusedAttacks: calcInfusion.range,
    finalResult,
  };
};

export default calculateSetup;
