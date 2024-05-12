import type { ElementModCtrl, Infusion, ModifierCtrl } from "@Src/types";
import type {
  AttackElement,
  AttackPattern,
  BonusKey,
  CalcItem,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CharacterBuffNAsConfig,
} from "../types";
import type { CalcUltilInfo } from "./calculation.types";
import { TrackerControl, type AttackBonusControl } from "./controls";

import { findByIndex, toArray } from "@Src/utils";
import { CharacterCalc, EntityCalc, GeneralCalc } from "./utils";
import { NORMAL_ATTACKS } from "../constants";

type AttackPatternConfArgs = CalcUltilInfo & {
  selfBuffCtrls: ModifierCtrl[];
  elmtModCtrls: ElementModCtrl;
  customInfusion: Infusion;
  attBonus: AttackBonusControl;
};

export default function AttackPatternConf({
  char,
  appChar,
  partyData,
  selfBuffCtrls,
  elmtModCtrls,
  customInfusion,
  attBonus,
}: AttackPatternConfArgs) {
  const normalsConfig: Partial<Record<AttackPattern, Omit<CharacterBuffNAsConfig, "forPatt">>> = {};

  for (const ctrl of selfBuffCtrls) {
    const buff = findByIndex(appChar.buffs ?? [], ctrl.index);

    if (ctrl.activated && buff?.normalsConfig) {
      for (const config of toArray(buff.normalsConfig)) {
        const { checkInput, forPatt = "ALL", ...rest } = config;
        const info = { char, appChar, partyData };

        if (EntityCalc.isApplicableEffect(config, info, ctrl.inputs ?? [], true)) {
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
      const { type = "attack" } = item;
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

      const finalAttPatt = normalsConfig[patternKey]?.attPatt ?? item.attPatt ?? defaultAttPatt;
      const finalAttElmt = normalsConfig[patternKey]?.attElmt ?? attElmt;

      const getTotalBonus = (key: BonusKey) => {
        return attBonus.get(key, finalAttPatt, type === "attack" ? finalAttElmt : undefined, item.id);
      };

      let rxnMult = 1;

      // deal elemental dmg and want amplify reaction
      if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
        rxnMult = GeneralCalc.getAmplifyingMultiplier(reaction, attElmt, attBonus.get("pct_", reaction));
      }
      const extraMult = getTotalBonus("mult_");

      const record = TrackerControl.initCalcItemRecord({
        itemType: type,
        multFactors: [],
        normalMult: 1,
        exclusives: attBonus.getExclusiveBonuses(item),
      });

      const configMultFactor = (factor: CalcItemMultFactor) => {
        const {
          root,
          scale = defaultScale,
          basedOn = defaultBasedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        // console.log("multFactor");
        // console.log(root, scale, basedOn);

        return {
          root,
          scale,
          basedOn,
        };
      };

      // console.log("====================");
      // console.log("calcItem", item.name);
      // console.log(finalAttPatt, finalAttElmt, reaction);

      return {
        type,
        attPatt: finalAttPatt,
        attElmt: finalAttElmt,
        rxnMult,
        extraMult,
        record,
        getTotalBonus,
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

  return config;
}

export type ConfigAttackPattern = ReturnType<typeof AttackPatternConf>;
