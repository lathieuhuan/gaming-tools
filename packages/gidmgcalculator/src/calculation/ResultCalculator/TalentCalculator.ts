import type { ElementModCtrl } from "@/types";
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

import Array_ from "@/utils/array-utils";
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
    factors: CalcItemMultFactor | CalcItemMultFactor[],
    multBonus: number,
    record: CalcItemRecord
  ) => {
    let bases: number[] = [];

    for (const factor of Array_.toArray(factors)) {
      const { root, scale, basedOn } = this.configMultFactor(factor);
      const value = this.totalAttr[basedOn];
      const finalMult = root * CharacterCalc.getTalentMult(scale, this.level) + multBonus;

      bases.push((value * finalMult) / 100);

      record.multFactors.push({
        value,
        desc: basedOn,
        talentMult: finalMult,
      });
    }

    return bases;
  };

  private joinBases = (bases: number[]) => {
    return bases.reduce((accumulator, base) => accumulator + base, 0);
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
    });
    let result: CalculationFinalResultItem;

    switch (type) {
      case "attack": {
        if (item.lunar) {
          const { attElmt } = this.getElementAttribute(item, elmtModCtrl, infusedElmt);
          const calculator = this.itemCalculator.genLunarCalculator(item.lunar, attElmt, item.id);

          if (this.disabled) {
            return calculator.emptyResult;
          }

          const multBonus = calculator.getBonus("mult_");
          const bases = this.getBases(item.multFactors, multBonus, record);
          const base = item.joinMultFactors ? this.joinBases(bases) : bases;

          // TALENT RESULT
          result = calculator.calculate(base, record);
        } //
        else {
          const attPatt = this.alterConfig.attPatt || item.attPatt || this.default_.attPatt;
          const { attElmt, reaction } = this.getElementAttribute(item, elmtModCtrl, infusedElmt);
          const calculator = this.itemCalculator.genAttackCalculator(attPatt, attElmt, item.id);

          if (this.disabled) {
            return calculator.emptyResult;
          }

          const multBonus = calculator.getBonus("mult_");
          const bases = this.getBases(item.multFactors, multBonus, record);
          const base = item.joinMultFactors ? this.joinBases(bases) : bases;

          // TALENT RESULT
          result = calculator.calculate(base, reaction, record);
        }
        break;
      }
      default: {
        const calculator = this.itemCalculator.genOtherCalculator(type, item.id);
        const multBonus = this.itemCalculator.getBonus("mult_", item.id);
        const bases = this.getBases(item.multFactors, multBonus, record);

        if (item.flatFactor) {
          const { root, scale } = this.configFlatFactor(item.flatFactor);
          const flatBonus = root * CharacterCalc.getTalentMult(scale, this.level);

          bases.forEach((_, i) => (bases[i] += flatBonus));
          record.totalFlat = flatBonus;
        }

        // TALENT RESULT
        result = calculator.calculate(bases, record);
      }
    }

    this.tracker?.recordCalcItem(this.resultKey, item.name, record);

    return result;
  };
}
