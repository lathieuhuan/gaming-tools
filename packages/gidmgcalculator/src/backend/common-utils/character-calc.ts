import type { Character } from "@Src/types";
import type {
  ActualAttackPattern,
  AppCharacter,
  AttackPattern,
  CalcItemBasedOn,
  EffectApplicableCondition,
  LevelableTalentType,
} from "../types";
import { GeneralCalc } from "./general-calc";

const TALENT_LV_MULTIPLIERS: Record<number, number[]> = {
  // some NA, CA, Eula's PA
  1: [0, 1, 1.08, 1.16, 1.275, 1.35, 1.45, 1.575, 1.7, 1.8373, 1.9768, 2.1264, 2.3245, 2.5125, 2.7, 2.906],
  // percentage
  2: [0, 1, 1.075, 1.15, 1.25, 1.325, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.125, 2.25, 2.375],
  // flat
  3: [0, 1, 1.1, 1.2, 1.325, 1.45, 1.575, 1.725, 1.875, 2.025, 2.2, 2.375, 2.55, 2.75, 2.95, 3.16],
  // NA: Aloy, Razor, Yoimiya; Xiao NA+CA, Hu Tao NAs, raiden's sword attacks
  4: [0, 1, 1.068, 1.136, 1.227, 1.295, 1.375, 1.477, 1.579, 1.682, 1.784, 1.886, 1.989, 2.091, 2.193, 2.295],
  // hutao E, xiao Q, yanfei Q, yoimiya E, aloy E, wanderer E, wriothesley E
  5: [0, 1, 1.06, 1.12, 1.198, 1.258, 1.318, 1.396, 1.474, 1.552, 1.629, 1.708, 1.784, 1.862, 1.94, 2.018],
  // zhongli Q
  6: [0, 1, 1.108, 1.216, 1.351, 1.473, 1.595, 1.757, 1.919, 2.081, 2.243, 2.405, 2.568, 2.703, 2.838, 2.973],
  // major NA, CA, PA
  7: [0, 1, 1.081, 1.163, 1.279, 1.361, 1.454, 1.581, 1.709, 1.837, 1.977, 2.116, 2.256, 2.395, 2.535, 2.675],
};

export class CharacterCalc {
  //
  static getTalentMult(scale: number, level: number): number {
    return scale ? TALENT_LV_MULTIPLIERS[scale]?.[level] ?? 0 : 1;
  }

  static getTalentDefaultInfo(
    expectedAttPatt: AttackPattern,
    appCharacter: AppCharacter
  ): {
    resultKey: LevelableTalentType;
    scale: number;
    basedOn: CalcItemBasedOn;
    attPatt: ActualAttackPattern;
    flatFactorScale: number;
  } {
    const resultKey = expectedAttPatt === "ES" || expectedAttPatt === "EB" ? expectedAttPatt : "NAs";
    const defaultScale = resultKey === "NAs" && appCharacter.weaponType !== "catalyst" ? 7 : 2;
    const {
      scale = defaultScale,
      basedOn = "atk",
      attPatt = expectedAttPatt,
    } = appCharacter.calcListConfig?.[expectedAttPatt] || {};

    return {
      resultKey,
      scale,
      basedOn,
      attPatt,
      flatFactorScale: 3,
    };
  }

  static isGrantedEffect = (condition: Pick<EffectApplicableCondition, "grantedAt">, character: Character) => {
    if (condition.grantedAt) {
      const [prefix, level] = condition.grantedAt;
      return (prefix === "A" ? GeneralCalc.getAscension(character.level) : character.cons) >= +level;
    }
    return true;
  };
}
