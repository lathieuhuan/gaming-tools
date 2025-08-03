import type { ElementModCtrl } from "@Src/types";
import type { CalcTeamData } from "../utils/CalcTeamData";
import type { AttackBonusesArchive } from "../InputProcessor";
import type { CalcItemRecord } from "../utils/TrackerControl";
import type {
  AppCharacter,
  AttackAlterConfig,
  AttackElement,
  AttackPattern,
  AttackReaction,
  CalcItemFlatFactor,
  CalcItemMultFactor,
  CalculationFinalResultItem,
  LevelableTalentType,
  TalentCalcItem,
  TotalAttribute,
} from "../types";

import Array_ from "@Src/utils/array-utils";
import { CharacterCalc } from "../utils/calc-utils";
import { TrackerControl } from "../utils/TrackerControl";
import { CalcItemCalculator } from "./CalcItemCalculator";

type InternalElmtModCtrl = Pick<ElementModCtrl, "reaction" | "infuse_reaction" | "absorb_reaction" | "absorption">;

export class TalentCalculator {
  resultKey: LevelableTalentType;
  disabled: boolean;
  level: number;
  private default_: Omit<ReturnType<typeof CharacterCalc.getTalentDefaultInfo>, "resultKey">;
  private appCharacter: AppCharacter;

  constructor(
    patternKey: AttackPattern,
    private alterConfig: AttackAlterConfig = {},
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    teamData: CalcTeamData,
    private itemCalculator: CalcItemCalculator,
    private tracker?: TrackerControl
  ) {
    this.appCharacter = teamData.activeAppMember;

    const default_ = CharacterCalc.getTalentDefaultInfo(patternKey, this.appCharacter);

    this.default_ = default_;
    this.resultKey = default_.resultKey;
    this.disabled = alterConfig?.disabled === true;
    this.level = teamData.getFinalTalentLv(this.resultKey);
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
    elmtModCtrl: InternalElmtModCtrl,
    infusedElmt: AttackElement
  ): {
    attElmt: AttackElement;
    reaction: AttackReaction;
  } => {
    const { appCharacter, alterConfig } = this;
    let attElmt: AttackElement;
    /**
     * This is the reaction expected by user.
     * No need to validate if this attack can cause this reaction 'cause it will be checked later
     */
    let reaction = elmtModCtrl.reaction;

    // AttElmt priority:
    // 1. NAs of (catalyst) or FCA
    // 2. item.attElmt
    // 3. infusedElmt (custom infusion) (if NAs)
    // 4. alterConfig (get from CharacterBuffNormalAttackConfig)
    // 5. phys (if NAs) | appCharacter.vision (otherwise)

    if (item.attElmt === "absorb") {
      // this attack can absorb element (anemo abilities) but user may not activate absorption
      attElmt = elmtModCtrl.absorption || "anemo";
      reaction = elmtModCtrl.absorb_reaction;
    } //
    else if (this.resultKey === "NAs") {
      // The element of these attacks is the same as the character's element (vision)
      if (appCharacter.weaponType === "catalyst" || item.subAttPatt === "FCA") {
        attElmt = appCharacter.vision;
      } //
      else if (item.attElmt) {
        attElmt = item.attElmt;
      }
      // There is Custom (external) Infusion
      else if (infusedElmt !== "phys") {
        attElmt = infusedElmt;
        reaction = elmtModCtrl.infuse_reaction;

        // if external infusion is the same as self infusion or character's element,
        // infuse_reaction should be null and reaction (default) should be used instead
        if (infusedElmt === alterConfig.attElmt || infusedElmt === appCharacter.vision) {
          reaction = elmtModCtrl.reaction;
        }
      } //
      else {
        attElmt = alterConfig.attElmt || "phys";
      }
    } //
    else {
      attElmt = item.attElmt || alterConfig.attElmt || appCharacter.vision;
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
    elmtModCtrl: InternalElmtModCtrl,
    infusedElmt: AttackElement
  ): CalculationFinalResultItem => {
    const { type = "attack" } = item;
    //
    const record = TrackerControl.initCalcItemRecord({
      itemType: type,
      multFactors: [],
      bonusMult: 1,
      exclusives: this.attkBonusesArchive.getExclusiveBonuses(item),
      tags: item.tags,
    });
    let result: CalculationFinalResultItem;

    switch (type) {
      case "attack": {
        const isLunar = item.tags?.some((tag) => tag.startsWith("lunar"));
        const attPatt = this.alterConfig.attPatt || item.attPatt || this.default_.attPatt;
        const { attElmt, reaction } = this.getElementAttribute(item, elmtModCtrl, infusedElmt);
        const calculator = this.itemCalculator.genAttackCalculator(attPatt, attElmt, item.tags, item.id);

        if (this.disabled) {
          return calculator.emptyResult;
        }

        const bonus = calculator.getBonus("mult_");
        const bases = this.getBases(item.multFactors, bonus, record);
        const base = item.joinMultFactors ? bases.reduce((accumulator, base) => accumulator + base, 0) : bases;

        // TALENT DMG
        result = calculator.calculate(base, reaction, record, isLunar);

        break;
      }
      default: {
        const calculator = this.itemCalculator.genOtherCalculator(type, item.id);
        const bonus = this.itemCalculator.getBonus("mult_", item.id);
        const bases = this.getBases(item.multFactors, bonus, record);

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
