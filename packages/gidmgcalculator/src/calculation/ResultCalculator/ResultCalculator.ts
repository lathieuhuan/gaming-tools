import type { AttackBonusesArchive } from "../InputProcessor";
import type { TrackerControl } from "../utils/TrackerControl";
import type { AttackAlterConfigs, AttackPattern, ResistReduction, TotalAttribute } from "../types";

import { CalcTeamData } from "../utils/CalcTeamData";
import { GeneralCalc } from "../utils/calc-utils";
import { CalcItemCalculator } from "./CalcItemCalculator";
import { LunarReactionCalculator } from "./LunarReactionCalculator";
import { ReactionCalculator } from "./ReactionCalculator";
import { TalentCalculator } from "./TalentCalculator";

export class ResultCalculator {
  itemCalculator: CalcItemCalculator;

  constructor(
    targetLv: number,
    private teamData: CalcTeamData,
    private totalAttr: TotalAttribute,
    private attkBonusesArchive: AttackBonusesArchive,
    private attAlterConfigs: AttackAlterConfigs,
    private resistances: ResistReduction,
    private tracker?: TrackerControl
  ) {
    this.itemCalculator = new CalcItemCalculator(
      targetLv,
      GeneralCalc.getBareLv(teamData.activeMember.level),
      totalAttr,
      attkBonusesArchive,
      resistances
    );
  }

  genTalentCalculator = (patternKey: AttackPattern) => {
    return new TalentCalculator(
      patternKey,
      this.attAlterConfigs[patternKey],
      this.totalAttr,
      this.attkBonusesArchive,
      this.teamData,
      this.itemCalculator,
      this.tracker
    );
  };

  genReactionCalculator = () => {
    return new ReactionCalculator(
      this.teamData.activeMember.level,
      this.itemCalculator,
      this.resistances,
      this.tracker
    );
  };

  genLunarReactionCalculator = () => {
    return new LunarReactionCalculator(
      this.teamData.activeMember.level,
      this.itemCalculator,
      this.totalAttr,
      this.resistances,
      this.tracker
    );
  };
}
