import type { CalcSetup, Target } from "@Src/types";
import type { NormalAttack } from "@Src/backend/types";
import type { TrackerControl } from "./controls";

import { findByIndex } from "@Src/utils";
import { $AppCharacter, $AppData } from "@Src/services";
import { CharacterCalc } from "./utils";
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

  let infusedElement = customInfusion.element;
  let infusedAttacks: NormalAttack[] = ["NA", "CA", "PA"];
  let isCustomInfusion = true;
  let disabledNAs = false;

  /** false = overwritable infusion. true = unoverwritable. undefined = no infusion */
  let selfInfused: boolean | undefined = undefined;

  if (appChar.buffs) {
    for (const ctrl of selfBuffCtrls) {
      if (ctrl.activated) {
        const buff = findByIndex(appChar.buffs, ctrl.index);

        if (buff && buff.infuseConfig) {
          if (!selfInfused) {
            const info = { char, appChar, partyData };
            const isUsable = CharacterCalc.isUsableEffect(buff.infuseConfig, info, ctrl.inputs || [], true);

            if (isUsable) {
              selfInfused = !buff.infuseConfig.overwritable;
            }
          }
          if (!disabledNAs) {
            disabledNAs = buff.infuseConfig.disabledNAs || false;
          }
        }
      }
    }
  }

  if (infusedElement === "phys" && selfInfused !== undefined) {
    infusedElement = appChar.vision;
    isCustomInfusion = false;
  } else if (infusedElement === appChar.vision) {
    isCustomInfusion = false;
  }

  if (appChar.weaponType === "bow") {
    infusedAttacks = ["NA"];
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
    infusion: {
      element: infusedElement,
      isCustom: isCustomInfusion,
      range: infusedAttacks,
    },
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
    infusedElement,
    infusedAttacks,
    finalResult,
  };
};
