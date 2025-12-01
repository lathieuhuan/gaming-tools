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
    const maxLv = +maxLvString;

    return {
      bareLv: +bareLvString,
      ascension: maxLv === 20 ? 0 : maxLv >= 90 ? 6 : maxLv / 10 - 3,
    };
  }
}
