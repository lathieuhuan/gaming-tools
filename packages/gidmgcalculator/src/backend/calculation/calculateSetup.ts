import type { CalcSetup, Target } from "@Src/types";
import type { TrackerControl } from "./controls";

import { $AppCharacter, $AppData } from "@Src/services";
import { AttackPatternConf } from "./attack-pattern-conf";
import getCalculationStats from "./getCalculationStats";
import getFinalResult from "./getFinalResult";
import { AttackElement, NormalAttack } from "../types";

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

  const { artAttr, ...rest } = getCalculationStats({
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
    // infusedElement: infusion.element,
    tracker,
  });

  const attackPatternConf = AttackPatternConf({
    char,
    appChar,
    partyData,
    selfBuffCtrls,
    elmtModCtrls,
    customInfusion,
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
    customDebuffCtrls,
    elmtModCtrls,
    attackPatternConf,
    target,
    tracker,
    ...rest,
  });
  // console.timeEnd();
  return {
    totalAttr: rest.totalAttr,
    artAttr,
    rxnBonus: rest.rxnBonus,
    // infusedElement: attackPatternConf.infusedElement,
    // infusedAttacks: attackPatternConf.infusedAttacks,
    infusedElement: "phys" as AttackElement,
    infusedAttacks: ["NA"] as NormalAttack[],
    finalResult,
  };
};
