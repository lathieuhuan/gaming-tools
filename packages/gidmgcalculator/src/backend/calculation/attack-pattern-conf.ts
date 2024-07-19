import type { AttackReaction, ElementModCtrl, Infusion } from "@Src/types";
import type {
  AttackElement,
  AttackPattern,
  AttackBonusKey,
  CalcItem,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CalcItemType,
  ActualAttackPattern,
  AppCharacter,
} from "@Src/backend/types";
import type { AttackBonusControl, CalcItemRecord, TotalAttribute } from "@Src/backend/controls";

import { toArray } from "@Src/utils";
import { CharacterCalc, GeneralCalc } from "@Src/backend/utils";
import { TrackerControl } from "@Src/backend/controls";
import { NormalsConfig } from "./getNormalsConfig";

type InternalElmtModCtrls = Pick<ElementModCtrl, "reaction" | "infuse_reaction" | "absorption">;

export type CalcItemConfig = {
  type: CalcItemType;
  attPatt: ActualAttackPattern;
  attElmt: "pyro" | "hydro" | "electro" | "cryo" | "geo" | "anemo" | "dendro" | "phys";
  reaction: AttackReaction;
  rxnMult: number;
  record: CalcItemRecord;
  getBonus: (key: AttackBonusKey) => number;
  calculateBaseDamage: (level: number) => number | number[];
};

export type AttackPatternConfArgs = {
  appChar: AppCharacter;
  normalsConfig: NormalsConfig;
  customInfusion: Infusion;
  totalAttr: TotalAttribute;
  attBonus: AttackBonusControl;
};

export function AttackPatternConf({
  appChar,
  normalsConfig,
  customInfusion,
  totalAttr,
  attBonus,
}: AttackPatternConfArgs) {
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

    const configCalcItem = (item: CalcItem, elmtModCtrls: InternalElmtModCtrls): CalcItemConfig => {
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
      } else {
        reaction = null;
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

      return {
        type,
        attPatt,
        attElmt,
        reaction,
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
