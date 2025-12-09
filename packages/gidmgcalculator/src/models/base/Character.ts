import type { AppCharacter, ICharacter, ICharacterBasic, Level, TalentType } from "@/types";

import { ArtifactGear } from "./ArtifactGear";
import { Ascendable } from "./Ascendable";
import { Weapon } from "./Weapon";

const BASE_REACTION_DAMAGE: Record<number, number> = {
  1: 17.17,
  20: 80.58,
  40: 207.38,
  50: 323.6,
  60: 492.88,
  70: 765.64,
  80: 1077.44,
  90: 1446.85,
  95: 1561.468,
  100: 1674.8092,
};

const TALENT_LV_MULTIPLIERS: Record<number, number[]> = {
  // some NA, CA, Eula's PA
  1: [
    0, 1, 1.08, 1.16, 1.275, 1.35, 1.45, 1.575, 1.7, 1.8373, 1.9768, 2.1264, 2.3245, 2.5125, 2.7,
    2.906,
  ],
  // percentage
  2: [0, 1, 1.075, 1.15, 1.25, 1.325, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.125, 2.25, 2.375],
  // flat
  3: [0, 1, 1.1, 1.2, 1.325, 1.45, 1.575, 1.725, 1.875, 2.025, 2.2, 2.375, 2.55, 2.75, 2.95, 3.16],
  // NA: Aloy, Razor, Yoimiya; Xiao NA+CA, Hu Tao NAs, raiden's sword attacks
  4: [
    0, 1, 1.068, 1.136, 1.227, 1.295, 1.375, 1.477, 1.579, 1.682, 1.784, 1.886, 1.989, 2.091, 2.193,
    2.295,
  ],
  // hutao E, xiao Q, yanfei Q, yoimiya E, aloy E, wanderer E, wriothesley E
  5: [
    0, 1, 1.06, 1.12, 1.198, 1.258, 1.318, 1.396, 1.474, 1.552, 1.629, 1.708, 1.784, 1.862, 1.94,
    2.018,
  ],
  // zhongli Q
  6: [
    0, 1, 1.108, 1.216, 1.351, 1.473, 1.595, 1.757, 1.919, 2.081, 2.243, 2.405, 2.568, 2.703, 2.838,
    2.973,
  ],
  // major NA, CA, PA
  7: [
    0, 1, 1.081, 1.163, 1.279, 1.361, 1.454, 1.581, 1.709, 1.837, 1.977, 2.116, 2.256, 2.395, 2.535,
    2.675,
  ],
};

export class Character<W extends Weapon = Weapon, A extends ArtifactGear = ArtifactGear>
  extends Ascendable
  implements ICharacter<W, A>
{
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;

  weapon: W;
  atfGear: A;

  isTraveler: boolean;

  get baseRxnDamage() {
    return BASE_REACTION_DAMAGE[this.bareLv] ?? 0;
  }

  constructor(info: ICharacter<W, A>, public data: AppCharacter) {
    super(info.level);

    this.name = info.name;
    this.level = info.level;
    this.NAs = info.NAs;
    this.ES = info.ES;
    this.EB = info.EB;
    this.cons = info.cons;
    this.enhanced = info.enhanced;

    this.weapon = info.weapon;
    this.atfGear = info.atfGear;

    this.isTraveler = data.name.slice(-8) === "Traveler";
  }

  getTotalXtraTalentLv(talentType: TalentType) {
    let result = 0;

    if (talentType !== "altSprint") {
      const requiredConsLv = this.data.talentLvBonus?.[talentType];

      if (requiredConsLv && this.cons >= requiredConsLv) {
        result += 3;
      }
    }

    return result;
  }

  getFinalTalentLv(talent: TalentType) {
    return talent === "altSprint" ? 1 : this[talent] + this.getTotalXtraTalentLv(talent);
  }

  static getTalentMult(scale: number, talentLv: number) {
    return scale ? TALENT_LV_MULTIPLIERS[scale]?.[talentLv] ?? 0 : 1;
  }

  serialize(): ICharacterBasic {
    return {
      name: this.name,
      level: this.level,
      NAs: this.NAs,
      ES: this.ES,
      EB: this.EB,
      cons: this.cons,
      enhanced: this.enhanced,
    };
  }
}
