import type { CalcSetup, Target, Tracker } from "@Src/types";
import { $AppCharacter, $AppData } from "@Src/services";
import getCalculationStats from "./getCalculationStats";
import getFinalResult from "./getFinalResult";

const calculateSetup = (setup: CalcSetup, target: Target, tracker?: Tracker) => {
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
    infusedElement: calcInfusion.element,
    infusedAttacks: calcInfusion.range,
    charStatus: rest.charStatus,
    totalAttr: rest.totalAttr,
    artAttr,
    rxnBonus: rest.rxnBonus,
    finalResult,
  };
};

export default calculateSetup;
