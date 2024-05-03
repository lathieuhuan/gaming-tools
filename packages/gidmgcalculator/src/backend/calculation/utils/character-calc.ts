import type {
  ActualAttackPattern,
  AppCharacter,
  AttackElement,
  AttackPattern,
  CharacterEffectLevelScale,
  ElementType,
  LevelableTalentType,
  TalentAttributeType,
  TalentType,
  WeaponType,
} from "@Src/backend/types";
import type { Character, PartyData } from "@Src/types";
import type { CalcUltilInfo } from "../calculation.types";

import { findByName } from "@Src/utils";

interface GetTotalXtraTalentArgs {
  char: Character;
  appChar: AppCharacter;
  talentType: TalentType;
  partyData?: PartyData;
}

const TALENT_LV_MULTIPLIERS: Record<number, number[]> = {
  // normal attack && physical
  1: [0, 1, 1.08, 1.16, 1.275, 1.35, 1.45, 1.575, 1.7, 1.8373, 1.9768, 2.1264, 2.3245, 2.5125, 2.7, 2.906],
  // percentage
  2: [0, 1, 1.075, 1.15, 1.25, 1.325, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.125, 2.25, 2.375],
  // flat
  3: [0, 1, 1.1, 1.2, 1.325, 1.45, 1.575, 1.725, 1.875, 2.025, 2.2, 2.375, 2.55, 2.75, 2.95, 3.16],
  // razor NA, xiao NA+CA, hutao NAs, yoimiya NA, raiden's sword attacks
  4: [0, 1, 1.068, 1.136, 1.227, 1.295, 1.375, 1.477, 1.579, 1.682, 1.784, 1.886, 1.989, 2.091, 2.193, 2.295],
  // hutao E, xiao Q, yanfei Q, yoimiya E, aloy E, wanderer E, wriothesley E
  5: [0, 1, 1.06, 1.12, 1.198, 1.258, 1.318, 1.396, 1.474, 1.552, 1.629, 1.708, 1.784, 1.862, 1.94, 2.018],
  // zhongli Q
  6: [0, 1, 1.108, 1.216, 1.351, 1.473, 1.595, 1.757, 1.919, 2.081, 2.243, 2.405, 2.568, 2.703, 2.838, 2.973],
  // plunge, most aim shot, razor CA, ayato NAs, cyno NAs while EB, wanderer NA, neuvillette CA, alecchino NAs
  7: [0, 1, 1.081, 1.163, 1.279, 1.361, 1.454, 1.581, 1.709, 1.837, 1.977, 2.116, 2.256, 2.395, 2.535, 2.675],
};

export class CharacterCalc {
  static getTotalXtraTalentLv({ char, appChar, talentType, partyData }: GetTotalXtraTalentArgs): number {
    let result = 0;

    if (talentType === "NAs") {
      if (char.name === "Tartaglia" || (partyData && findByName(partyData, "Tartaglia"))) {
        result++;
      }
    }
    if (talentType !== "altSprint") {
      const consLv = appChar.talentLvBonus?.[talentType];

      if (consLv && char.cons >= consLv) {
        result += 3;
      }
    }
    return result;
  }

  static getFinalTalentLv(args: GetTotalXtraTalentArgs): number {
    const talentLv = args.talentType === "altSprint" ? 0 : args.char[args.talentType];
    return talentLv + this.getTotalXtraTalentLv(args);
  }

  static getTalentMult(scale: number, level: number): number {
    return scale ? TALENT_LV_MULTIPLIERS[scale][level] : 1;
  }

  static getLevelScale(
    scale: CharacterEffectLevelScale | undefined,
    info: CalcUltilInfo,
    inputs: number[],
    fromSelf: boolean
  ): number {
    if (scale) {
      const { talent, value, alterIndex = 0, max } = scale;
      const level = fromSelf
        ? this.getFinalTalentLv({
            talentType: talent,
            char: info.char,
            appChar: info.appChar,
            partyData: info.partyData,
          })
        : inputs[alterIndex] ?? 0;

      const result = value ? this.getTalentMult(value, level) : level;
      return max && result > max ? max : result;
    }
    return 1;
  }

  static getTalentDefaultInfo(
    key: LevelableTalentType,
    weaponType: WeaponType,
    elementType: ElementType,
    expectedAttPatt: AttackPattern,
    config?: AppCharacter["multFactorConf"]
  ): {
    attElmt: AttackElement;
    attPatt: ActualAttackPattern;
    scale: number;
    basedOn: TalentAttributeType;
    flatFactorScale: number;
  } {
    const attElmt = key === "NAs" && weaponType !== "catalyst" ? "phys" : elementType;
    const defaultScale = expectedAttPatt === "PA" ? 7 : attElmt === "phys" ? 1 : 2;
    const defaultBasedOn: TalentAttributeType = "atk";
    const {
      scale = defaultScale,
      basedOn = defaultBasedOn,
      attPatt = expectedAttPatt,
    } = config?.[expectedAttPatt] || {};

    return {
      attElmt,
      attPatt,
      scale,
      basedOn,
      flatFactorScale: 3,
    };
  }
}
