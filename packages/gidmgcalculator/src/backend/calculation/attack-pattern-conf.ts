import type { ElementModCtrl, Infusion, ModifierCtrl } from "@Src/types";
import type {
  AttackElement,
  AttackPattern,
  CalcItem,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CharacterBuffNAsConfig,
} from "../types";
import type { CalcUltilInfo } from "./calculation.types";

import { findByIndex, toArray } from "@Src/utils";
import { CharacterCalc } from "./utils";
import { NORMAL_ATTACKS } from "../constants";

type AttackPatternConfArgs = CalcUltilInfo & {
  selfBuffCtrls: ModifierCtrl[];
  elmtModCtrls: ElementModCtrl;
  customInfusion: Infusion;
};

export function AttackPatternConf({
  char,
  appChar,
  partyData,
  selfBuffCtrls,
  elmtModCtrls,
  customInfusion,
}: AttackPatternConfArgs) {
  const normalsConfig: Partial<Record<AttackPattern, Omit<CharacterBuffNAsConfig, "naType">>> = {};

  for (const ctrl of selfBuffCtrls) {
    const buff = findByIndex(appChar.buffs ?? [], ctrl.index);

    if (ctrl.activated && buff?.normalsConfigs) {
      for (const config of toArray(buff?.normalsConfigs)) {
        const { forPatt = "ALL", ...rest } = config;

        if (forPatt === "ALL") {
          for (const type of NORMAL_ATTACKS) {
            normalsConfig[type] = rest;
          }
        } else {
          normalsConfig[forPatt] = rest;
        }
      }
    }
  }

  const config = (patternKey: AttackPattern) => {
    const {
      resultKey,
      defaultAttPatt,
      defaultBasedOn,
      defaultScale,
      defaultFlatFactorScale,
      //
    } = CharacterCalc.getTalentDefaultInfo(patternKey, appChar);

    let reaction = elmtModCtrls.reaction;

    const configCalcItem = (item: CalcItem) => {
      let attElmt: AttackElement;

      if (item.attElmt) {
        if (item.attElmt === "absorb") {
          // this attack can absorb element (anemo abilities) but user may or may not activate absorption
          attElmt = elmtModCtrls.absorption || appChar.vision;
        } else {
          attElmt = item.attElmt;
        }
      } else if (appChar.weaponType === "catalyst" || item.subAttPatt === "FCA" || resultKey !== "NAs") {
        attElmt = appChar.vision;
      } else if (resultKey === "NAs" && customInfusion.element !== "phys") {
        attElmt = customInfusion.element;
        reaction = elmtModCtrls.infuse_reaction;
      } else {
        attElmt = "phys";
      }

      const configMultFactor = (factor: CalcItemMultFactor) => {
        const {
          root,
          scale = defaultScale,
          basedOn = defaultBasedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        return {
          root,
          scale,
          basedOn,
        };
      };

      return {
        attElmt: normalsConfig[patternKey]?.attElmt ?? attElmt,
        attPatt: normalsConfig[patternKey]?.attPatt ?? item.attPatt ?? defaultAttPatt,
        reaction,
        configMultFactor,
      };
    };

    const configFlatFactor = (factor: CalcItemFlatFactor) => {
      const { root, scale = 3 } = typeof factor === "number" ? { root: factor } : factor;
      return {
        root,
        scale,
      };
    };

    return {
      resultKey,
      disabled: normalsConfig[patternKey]?.disabled,
      defaultFlatFactorScale,
      configCalcItem,
      configFlatFactor,
    };
  };

  return {
    // disabledNAs,
    // infusedElement: infusion.element,
    // infusedAttacks: infusion.range,
    config,
  };
}
