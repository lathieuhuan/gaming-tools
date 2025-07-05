import type { AttackAlterer, AttackBonusesArchive } from "../InputProcessor";
import type { TrackerControl } from "../TrackerControl";
import type { AttackPattern, ResistReduction, TotalAttribute } from "../types";

import { CharacterReadData, GeneralCalc } from "../common";
import { CalcItemCalculator } from "./CalcItemCalculator";
import { LunarReactionCalculator } from "./LunarReactionCalculator";
import { ReactionCalculator } from "./ReactionCalculator";
import { TalentCalculator } from "./TalentCalculator";

export class ResultCalculator {
  itemCalculator: CalcItemCalculator;

  constructor(
    targetLv: number,
    private characterData: CharacterReadData,
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    private attackAlterer: AttackAlterer,
    private resistances: ResistReduction,
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
      this.attackAlterer.getConfig(patternKey),
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

  genLunarReactionCalculator = () => {
    return new LunarReactionCalculator(
      this.characterData.character.level,
      this.itemCalculator,
      this.resistances,
      this.tracker
    );
  };
}
