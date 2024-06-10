import type { PartiallyRequired } from "rond";
import type { ElementModCtrl, Infusion, ModifierCtrl } from "@Src/types";
import type {
  AttackElement,
  AttackPattern,
  AttackBonusKey,
  CalcItem,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CharacterBuffNAsConfig,
} from "@Src/backend/types";
import type { AttackBonusControl, TotalAttribute } from "@Src/backend/controls";

import { findByIndex, toArray } from "@Src/utils";
import { CharacterCalc, EntityCalc, GeneralCalc, type CalculationInfo } from "@Src/backend/utils";
import { TrackerControl } from "@Src/backend/controls";
import { NORMAL_ATTACKS } from "@Src/backend/constants";

type AttackPatternConfArgs = CalculationInfo & {
  selfBuffCtrls: ModifierCtrl[];
  elmtModCtrls: PartiallyRequired<Partial<ElementModCtrl>, "reaction" | "infuse_reaction" | "absorption">;
  customInfusion: Infusion;
  totalAttr: TotalAttribute;
  attBonus: AttackBonusControl;
};

export function AttackPatternConf({
  char,
  appChar,
  partyData,
  selfBuffCtrls,
  elmtModCtrls,
  customInfusion,
  totalAttr,
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

  return (patternKey: AttackPattern) => {
    const {
      resultKey,
      defaultAttPatt,
      defaultBasedOn,
      defaultScale,
      defaultFlatFactorScale,
      //
    } = CharacterCalc.getTalentDefaultInfo(patternKey, appChar);

    const configFlatFactor = (factor: CalcItemFlatFactor) => {
      const { root, scale = defaultFlatFactorScale } = typeof factor === "number" ? { root: factor } : factor;
      return {
        root,
        scale,
      };
    };

    const configCalcItem = (item: CalcItem) => {
      const { type = "attack" } = item;

      /** ========== Attack Pattern, Attack Element, Reaction ========== */

      const attPatt = item.attPatt ?? normalsConfig[patternKey]?.attPatt ?? defaultAttPatt;
      let attElmt: AttackElement;
      let reaction = elmtModCtrls.reaction;

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
        /**
         * when the customInfusion.element is the same as appChar.vision (e.g. Pyro)
         * elmtModCtrls.infuse_reaction will be null, because the reaction of NAs will be the same as ES and EB,
         * so we use elmtModCtrls.reaction instead
         */
        reaction = elmtModCtrls.infuse_reaction ?? elmtModCtrls.reaction;
      } else {
        attElmt = normalsConfig[patternKey]?.attElmt ?? "phys";
      }

      const getBonus = (key: AttackBonusKey) => {
        const finalAttPatt = attPatt === "none" ? undefined : attPatt;

        if (type === "attack") {
          const mixedType = finalAttPatt ? (`${finalAttPatt}.${attElmt}` as const) : undefined;
          return attBonus.get(key, finalAttPatt, attElmt, mixedType, item.id);
        }
        return attBonus.get(key, finalAttPatt, item.id);
      };

      /** ========== Attack Reaction Multiplier ========== */

      let rxnMult = 1;

      // deal elemental dmg and want amplifying reaction
      if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
        rxnMult = GeneralCalc.getAmplifyingMultiplier(reaction, attElmt, attBonus.getBare("pct_", reaction));
      }

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

      const calculateBaseDamage = (level: number) => {
        let bases: number[] = [];

        // CALCULATE BASE DAMAGE
        for (const factor of toArray(item.multFactors)) {
          const { root, scale, basedOn } = configMultFactor(factor);
          const finalMult = root * CharacterCalc.getTalentMult(scale, level) + getBonus("mult_");

          record.multFactors.push({
            value: totalAttr[basedOn],
            desc: basedOn,
            talentMult: finalMult,
          });
          bases.push((totalAttr[basedOn] * finalMult) / 100);
        }

        if (item.joinMultFactors) {
          bases = [bases.reduce((accumulator, base) => accumulator + base, 0)];
        }

        if (item.flatFactor) {
          const { root, scale } = configFlatFactor(item.flatFactor);
          const flatBonus = root * CharacterCalc.getTalentMult(scale, level);

          bases = bases.map((base) => base + flatBonus);
          record.totalFlat = flatBonus;
        }

        return bases.length > 1 ? bases : bases[0];
      };

      // console.log("====================");
      // console.log("calcItem", item.name);
      // console.log(finalAttPatt, finalAttElmt, reaction);

      return {
        type,
        attPatt,
        attElmt,
        rxnMult,
        record,
        getBonus,
        calculateBaseDamage,
      };
    };

    return {
      resultKey,
      disabled: normalsConfig[patternKey]?.disabled,
      configCalcItem,
    };
  };
}

export type ConfigAttackPattern = ReturnType<typeof AttackPatternConf>;
