import type { Level } from "@/types";

export class Ascendable {
  bareLv: number;
  ascension: number;

  constructor(level: Level) {
    const { bareLv, ascension } = Ascendable.splitLevel(level);

    this.bareLv = bareLv;
    this.ascension = ascension;
  }

  static splitLevel(level: Level) {
    const [bareLvString, maxLvString] = level.split("/");
    const lvCap = +maxLvString;

    return {
      bareLv: +bareLvString,
      ascension: lvCap === 20 ? 0 : lvCap >= 90 ? 6 : lvCap / 10 - 3,
      lvCap,
    };
  }

  static getPossibleLvCaps(level: number, levelCaps: number[]): number[] {
    if (level >= 90) {
      return [level];
    }

    for (const [index, lvCap] of levelCaps.entries()) {
      if (lvCap === level) {
        return index ? [levelCaps[index - 1], lvCap] : [lvCap];
      }
      if (lvCap < level) {
        return [levelCaps[index - 1]];
      }
    }

    const lastLvCap = levelCaps[levelCaps.length - 1];

    return [lastLvCap];
  }

  // static getAscension(levelCap: number) {
  //   return levelCap === 20 ? 0 : levelCap >= 90 ? 6 : levelCap / 10 - 3;
  // };
}
