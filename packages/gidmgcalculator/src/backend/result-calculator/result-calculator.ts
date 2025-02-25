import type { AttackPattern, NormalAttacksConfig, ResistanceReduction, TotalAttribute } from "../types";
import type { AttackBonusesArchive, TrackerControl } from "../input-processor";

import { CharacterData, GeneralCalc } from "../common-utils";
import { CalcItemCalculator } from "./calc-item-calculator";
import { TalentCalculator } from "./talent-calculator";
import { ReactionCalculator } from "./reaction-calculator";

export class ResultCalculator {
  itemCalculator: CalcItemCalculator;

  constructor(
    targetLv: number,
    private characterData: CharacterData,
    private NAsConfig: NormalAttacksConfig,
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    private resistances: ResistanceReduction,
    private tracker?: TrackerControl
  ) {
    this.itemCalculator = new CalcItemCalculator(
      targetLv,
      GeneralCalc.getBareLv(characterData.character.level),
      totalAttr,
      attkBonusesArchive,
      resistances
    );
  }

  genTalentCalculator = (patternKey: AttackPattern) => {
    return new TalentCalculator(
      patternKey,
      this.NAsConfig,
      this.totalAttr,
      this.attkBonusesArchive,
      this.characterData,
      this.itemCalculator,
      this.tracker
    );
  };

  genReactionCalculator = () => {
    return new ReactionCalculator(
      this.characterData.character.level,
      this.itemCalculator,
      this.resistances,
      this.tracker
    );
  };
}
