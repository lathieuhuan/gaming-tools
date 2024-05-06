import type { CalcSetup, Target } from "@Src/types";
import type { NormalAttack } from "@Src/backend/types";
import { CalcListConfigControl, type TrackerControl } from "./controls";
import type { CalcInfusion } from "./calculation.types";

import { findByIndex } from "@Src/utils";
import { $AppCharacter, $AppData } from "@Src/services";
import { EntityCalc } from "./utils";
import getCalculationStats from "./getCalculationStats";
import getFinalResult from "./getFinalResult";

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

  const calcListConfig = new CalcListConfigControl();

  const infusion: CalcInfusion = {
    element: customInfusion.element,
    isCustom: true,
    range: ["NA", "CA", "PA"],
  };
  let disabledNAs = false;

  /** false = overwritable infusion. true = unoverwritable. undefined = no infusion */
  let selfInfused: boolean | undefined = undefined;

  for (const ctrl of selfBuffCtrls) {
    const buff = findByIndex(appChar.buffs ?? [], ctrl.index);

    if (ctrl.activated && buff) {
      //
      if (buff.infuseConfig) {
        if (!selfInfused) {
          const info = { char, appChar, partyData };
          const isUsable = EntityCalc.isApplicableEffect(buff.infuseConfig, info, ctrl.inputs || [], true);

          if (isUsable) {
            selfInfused = !buff.infuseConfig.overwritable;
          }
        }
        if (!disabledNAs) {
          disabledNAs = buff.infuseConfig.disabledNAs || false;
        }
      }
      if (buff.calcListConfig) {
        calcListConfig.update(buff.calcListConfig);
      }
    }
  }

  if (infusion.element === "phys" && selfInfused !== undefined) {
    infusion.element = appChar.vision;
    infusion.isCustom = false;
  } else if (infusion.element === appChar.vision) {
    infusion.isCustom = false;
  }

  if (appChar.weaponType === "bow") {
    infusion.range = ["NA"];
  }

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
    infusedElement: infusion.element,
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
    infusion,
    elmtModCtrls,
    target,
    calcListConfig,
    tracker,
    ...rest,
  });
  // console.timeEnd();
  return {
    totalAttr: rest.totalAttr,
    artAttr,
    rxnBonus: rest.rxnBonus,
    infusedElement: infusion.element,
    infusedAttacks: infusion.range,
    finalResult,
  };
};
