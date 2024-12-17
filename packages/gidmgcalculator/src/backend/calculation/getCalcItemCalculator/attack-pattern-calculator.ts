import type {
  AttackBonusKey,
  AttackElement,
  AttackPattern,
  AttackReaction,
  CalcItem,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CalculationFinalResultItem,
  LevelableTalentType,
} from "@Src/backend/types";
import type { ElementModCtrl } from "@Src/types";
import type { InternalCalcItemCalculator } from "./calc-item-calculator";
import type { CalculateCalcItemArgs } from "./calc-item-calculator-core";

import Array_ from "@Src/utils/array-utils";
import { CharacterCalc, GeneralCalc } from "@Src/backend/common-utils";
import { TrackerControl } from "@Src/backend/controls";

type InternalElmtModCtrls = Pick<ElementModCtrl, "reaction" | "infuse_reaction" | "absorption">;

type CalcItemConfig = Pick<
  CalculateCalcItemArgs,
  "type" | "attPatt" | "attElmt" | "rxnMult" | "record" | "getBonus"
> & {
  reaction: AttackReaction;
  calculateBaseDamage: (level: number) => number | number[];
};

export class AttackPatternCalculator {
  resultKey: LevelableTalentType;
  disabled: boolean;
  private level: number;
  private default_: ReturnType<typeof CharacterCalc.getTalentDefaultInfo>;

  constructor(private patternKey: AttackPattern, private parent: InternalCalcItemCalculator) {
    const { calcInfo, NAsConfig } = this.parent;

    this.default_ = CharacterCalc.getTalentDefaultInfo(patternKey, calcInfo.appChar);
    this.resultKey = this.default_.resultKey;
    this.disabled = NAsConfig[patternKey]?.disabled === true;
    this.level = CharacterCalc.getFinalTalentLv({ ...calcInfo, talentType: this.resultKey });
  }

  private configFlatFactor = (factor: CalcItemFlatFactor) => {
    const { root, scale = this.default_.flatFactorScale } = typeof factor === "number" ? { root: factor } : factor;
    return {
      root,
      scale,
    };
  };

  private configMultFactor = (factor: CalcItemMultFactor) => {
    const {
      root,
      scale = this.default_.scale,
      basedOn = this.default_.basedOn,
    } = typeof factor === "number" ? { root: factor } : factor;

    return {
      root,
      scale,
      basedOn,
    };
  };

  private configCalcItem = (item: CalcItem, elmtModCtrls: InternalElmtModCtrls): CalcItemConfig => {
    const {
      calcInfo: { appChar },
      NAsConfig,
      customInfusion,
      totalAttr,
      attkBonusesArchive,
    } = this.parent;
    const { patternKey, configFlatFactor, configMultFactor } = this;
    const { resultKey, attPatt: defaultAttPatt } = this.default_;
    const { type = "attack" } = item;

    /** ========== Attack Pattern, Attack Element, Reaction ========== */

    const attPatt = item.attPatt ?? NAsConfig[patternKey]?.attPatt ?? defaultAttPatt;
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
      attElmt = NAsConfig[patternKey]?.attElmt ?? "phys";
    }

    const getBonus = (key: AttackBonusKey) => {
      const finalAttPatt = attPatt === "none" ? undefined : attPatt;

      if (type === "attack") {
        const mixedType = finalAttPatt ? (`${finalAttPatt}.${attElmt}` as const) : undefined;
        return attkBonusesArchive.get(key, finalAttPatt, attElmt, mixedType, item.id);
      }
      return attkBonusesArchive.getBare(key, finalAttPatt, item.id);
    };

    /** ========== Attack Reaction Multiplier ========== */

    let rxnMult = 1;

    // deal elemental dmg and want amplifying reaction
    if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
      rxnMult = GeneralCalc.getAmplifyingMultiplier(reaction, attElmt, attkBonusesArchive.getBare("pct_", reaction));
    } else {
      reaction = null;
    }

    const record = TrackerControl.initCalcItemRecord({
      itemType: type,
      multFactors: [],
      normalMult: 1,
      exclusives: attkBonusesArchive.getExclusiveBonuses(item),
    });

    const calculateBaseDamage = (level: number) => {
      let bases: number[] = [];

      // CALCULATE BASE DAMAGE
      for (const factor of Array_.toArray(item.multFactors)) {
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

  calculate = (item: CalcItem, elmtModCtrls: InternalElmtModCtrls) => {
    const { tracker, genEmptyCalcFinalResultItem } = this.parent;
    const config = this.configCalcItem(item, elmtModCtrls);
    let result: CalculationFinalResultItem;

    if (this.disabled && config.type === "attack") {
      result = genEmptyCalcFinalResultItem(config.type, config.attPatt, config.attElmt);
    } //
    else {
      const base = config.calculateBaseDamage(this.level);

      // TALENT DMG
      result = this.parent.calculate({
        base,
        ...config,
      });
    }

    tracker?.recordCalcItem(this.resultKey, item.name, config.record);

    return result;
  };
}
