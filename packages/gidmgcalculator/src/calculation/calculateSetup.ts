import type { CalcSetup, NormalAttack, Target, Tracker } from "@Src/types";
import { findByIndex } from "@Src/utils";
import { $AppCharacter } from "@Src/services";
import getCalculationStats from "./getCalculationStats";
import getFinalResult from "./getFinalResult";
import { CharacterCal } from "./utils";

const calculateSetup = (
  {
    char,
    selfBuffCtrls,
    selfDebuffCtrls,
    party,
    weapon,
    wpBuffCtrls,
    artifacts,
    artBuffCtrls,
    artDebuffCtrls,
    elmtModCtrls,
    customBuffCtrls,
    customDebuffCtrls,
    customInfusion,
  }: CalcSetup,
  target: Target,
  tracker?: Tracker
) => {
  // console.time();
  const appChar = $AppCharacter.get(char.name);
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
            const isUsable = CharacterCal.isUsable(buff.infuseConfig, info, ctrl.inputs || [], true);

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
    appChar,
    selfBuffCtrls,
    weapon,
    wpBuffCtrls,
    artifacts,
    artBuffCtrls,
    elmtModCtrls,
    party,
    partyData,
    customBuffCtrls,
    infusedElement,
    tracker,
  });
  const finalResult = getFinalResult({
    char,
    appChar,
    selfDebuffCtrls,
    artDebuffCtrls,
    party,
    partyData,
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
    infusedElement,
    infusedAttacks,
    totalAttr: rest.totalAttr,
    artAttr,
    rxnBonus: rest.rxnBonus,
    finalResult,
  };
};

export default calculateSetup;
