import type { ElementModCtrl } from "@Src/types";
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
  TotalAttribute,
} from "../../types";

import Array_ from "@Src/utils/array-utils";
import { CharacterCalc, CharacterData } from "../../common-utils";
import { AttackBonusesArchive, CalcItemRecord, TrackerControl } from "../../controls";
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

  private getElementAttribute = (
    item: TalentCalcItem,
    elmtModCtrls: InternalElmtModCtrls,
    infusedElmnt: AttackElement
  ) => {
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
    } else if (default_.resultKey === "NAs" && infusedElmnt !== "phys") {
      attElmt = infusedElmnt;
      /**
       * when the infusedElmnt is the same as appCharacter.vision (e.g. Pyro)
       * elmtModCtrls.infuse_reaction will be null, because the reaction of NAs will be the same as ES and EB,
       * so we use elmtModCtrls.reaction instead
       */
      reaction = elmtModCtrls.infuse_reaction ?? elmtModCtrls.reaction;
    } else {
      attElmt = default_.attElmt;
    }

    return { attElmt, reaction };
  };

  private getBases = (
    multFactors: CalcItemMultFactor | CalcItemMultFactor[],
    multBonus: number,
    record: CalcItemRecord
  ) => {
    let bases: number[] = [];

    for (const factor of Array_.toArray(multFactors)) {
      const { root, scale, basedOn } = this.configMultFactor(factor);
      const finalMult = root * CharacterCalc.getTalentMult(scale, this.level) + multBonus;
      const value = this.totalAttr[basedOn];

      record.multFactors.push({
        value,
        desc: basedOn,
        talentMult: finalMult,
      });
      bases.push((value * finalMult) / 100);
    }

    return bases;
  };

  calculateItem = (
    item: TalentCalcItem,
    elmtModCtrls: InternalElmtModCtrls,
    infusedElmnt: AttackElement
  ): CalculationFinalResultItem => {
    const { type = "attack" } = item;
    //
    const record = TrackerControl.initCalcItemRecord({
      itemType: type,
      multFactors: [],
      normalMult: 1,
      exclusives: this.attkBonusesArchive.getExclusiveBonuses(item),
    });
    let result: CalculationFinalResultItem;

    switch (type) {
      case "attack": {
        const { attPatt = this.default_.attPatt } = item;
        const { attElmt, reaction } = this.getElementAttribute(item, elmtModCtrls, infusedElmnt);
        const calculator = this.itemCalculator.genAttackCalculator(attPatt, attElmt, item.id);

        if (this.disabled) {
          return calculator.emptyResult;
        }

        const bases = this.getBases(item.multFactors, calculator.getBonus("mult_"), record);
        const base = item.joinMultFactors ? bases.reduce((accumulator, base) => accumulator + base, 0) : bases;

        // TALENT DMG
        result = calculator.calculate(base, reaction, record);

        break;
      }
      default: {
        const calculator = this.itemCalculator.genOtherCalculator(type, item.id);
        const bases = this.getBases(item.multFactors, calculator.getBonus("mult_"), record);

        if (item.flatFactor) {
          const { root, scale } = this.configFlatFactor(item.flatFactor);
          const flatBonus = root * CharacterCalc.getTalentMult(scale, this.level);

          bases.forEach((_, i) => (bases[i] += flatBonus));
          record.totalFlat = flatBonus;
        }

        // TALENT DMG
        result = calculator.calculate(bases, record);
      }
    }

    this.tracker?.recordCalcItem(this.resultKey, item.name, record);

    return result;
  };
}
