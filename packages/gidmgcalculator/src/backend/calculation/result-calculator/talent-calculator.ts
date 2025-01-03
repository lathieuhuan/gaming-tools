import type { ElementModCtrl, Infusion } from "@Src/types";
import type {
  AppCharacter,
  AttackElement,
  AttackPattern,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CalculationFinalResultItem,
  LevelableTalentType,
  NormalAttacksConfig,
  TalentCalcItem,
  TalentCalcItemAttack,
  TotalAttribute,
} from "../../types";

import Array_ from "@Src/utils/array-utils";
import { CharacterCalc, CharacterData } from "../../common-utils";
import { AttackBonusesArchive, TrackerControl } from "../../controls";
import { CalcItemCalculator } from "./calc-item-calculator";

type InternalElmtModCtrls = Pick<ElementModCtrl, "reaction" | "infuse_reaction" | "absorption">;

export class TalentCalculator {
  resultKey: LevelableTalentType;
  disabled: boolean;
  level: number;
  private default_: ReturnType<typeof CharacterCalc.getTalentDefaultInfo> & {
    attElmt: AttackElement;
  };
  private appCharacter: AppCharacter;

  constructor(
    patternKey: AttackPattern,
    NAsConfig: NormalAttacksConfig,
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    characterData: CharacterData,
    private itemCalculator: CalcItemCalculator,
    private tracker?: TrackerControl
  ) {
    this.appCharacter = characterData.appCharacter;

    const default_ = CharacterCalc.getTalentDefaultInfo(patternKey, this.appCharacter);

    this.default_ = {
      ...default_,
      attPatt: NAsConfig[patternKey]?.attPatt ?? default_.attPatt,
      attElmt: NAsConfig[patternKey]?.attElmt ?? "phys",
    };

    this.resultKey = default_.resultKey;
    this.disabled = NAsConfig[patternKey]?.disabled === true;
    this.level = characterData.getFinalTalentLv(this.resultKey);
  }

  configFlatFactor = (factor: CalcItemFlatFactor) => {
    const { root, scale = this.default_.flatFactorScale } = typeof factor === "number" ? { root: factor } : factor;
    return {
      root,
      scale,
    };
  };

  configMultFactor = (factor: CalcItemMultFactor) => {
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

  getElementAttribute = (item: TalentCalcItemAttack, elmtModCtrls: InternalElmtModCtrls, customInfusion: Infusion) => {
    const { appCharacter, default_ } = this;

    let attElmt: AttackElement;
    let reaction = elmtModCtrls.reaction;

    if (item.attElmt) {
      if (item.attElmt === "absorb") {
        // this attack can absorb element (anemo abilities) but user may or may not activate absorption
        attElmt = elmtModCtrls.absorption || appCharacter.vision;
      } else {
        attElmt = item.attElmt;
      }
    } else if (appCharacter.weaponType === "catalyst" || item.subAttPatt === "FCA" || default_.resultKey !== "NAs") {
      attElmt = appCharacter.vision;
    } else if (default_.resultKey === "NAs" && customInfusion.element !== "phys") {
      attElmt = customInfusion.element;
      /**
       * when the customInfusion.element is the same as appCharacter.vision (e.g. Pyro)
       * elmtModCtrls.infuse_reaction will be null, because the reaction of NAs will be the same as ES and EB,
       * so we use elmtModCtrls.reaction instead
       */
      reaction = elmtModCtrls.infuse_reaction ?? elmtModCtrls.reaction;
    } else {
      attElmt = default_.attElmt;
    }

    return { attElmt, reaction };
  };

  calculateItem = (
    item: TalentCalcItem,
    elmtModCtrls: InternalElmtModCtrls,
    customInfusion: Infusion
  ): CalculationFinalResultItem => {
    const { level, totalAttr, attkBonusesArchive, default_ } = this;

    const record = TrackerControl.initCalcItemRecord({
      itemType: item.type,
      multFactors: [],
      normalMult: 1,
      exclusives: attkBonusesArchive.getExclusiveBonuses(item),
    });
    let result: CalculationFinalResultItem;

    switch (item.type) {
      case "attack": {
        const { attPatt = default_.attPatt } = item;
        const { attElmt, reaction } = this.getElementAttribute(item, elmtModCtrls, customInfusion);
        const calculator = this.itemCalculator.genAttackCalculator(attPatt, attElmt, item.id);

        if (this.disabled) {
          return calculator.emptyResult;
        }

        let bases: number[] = [];

        for (const factor of Array_.toArray(item.multFactors)) {
          const { root, scale, basedOn } = this.configMultFactor(factor);
          const finalMult = root * CharacterCalc.getTalentMult(scale, level) + calculator.getBonus("mult_");

          record.multFactors.push({
            value: totalAttr[basedOn],
            desc: basedOn,
            talentMult: finalMult,
          });
          bases.push((totalAttr[basedOn] * finalMult) / 100);
        }

        const base = item.joinMultFactors ? bases.reduce((accumulator, base) => accumulator + base, 0) : bases;

        // TALENT DMG
        result = calculator.calculate(base, reaction, record);

        break;
      }
      default: {
        const calculator = this.itemCalculator.genOtherCalculator(item.type, item.id);
        let base = 0;

        const { root, scale, basedOn } = this.configMultFactor(item.multFactors);
        const finalMult = root * CharacterCalc.getTalentMult(scale, level) + calculator.getBonus("mult_");

        record.multFactors.push({
          value: totalAttr[basedOn],
          desc: basedOn,
          talentMult: finalMult,
        });

        base += (totalAttr[basedOn] * finalMult) / 100;

        if (item.flatFactor) {
          const { root, scale } = this.configFlatFactor(item.flatFactor);
          const flatBonus = root * CharacterCalc.getTalentMult(scale, level);

          base += flatBonus;
          record.totalFlat = flatBonus;
        }

        // TALENT DMG
        result = calculator.calculate(base, record);
      }
    }

    this.tracker?.recordCalcItem(this.resultKey, item.name, record);

    return result;
  };
}
