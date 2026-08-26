import type { Level } from "@/types";

export class Ascendable {
  readonly bareLv: number;
  readonly ascension: number;

  constructor(level: Level) {
    const { bareLv, ascension } = this.splitLevel(level);

    this.bareLv = bareLv;
    this.ascension = ascension;
  }

  private splitLevel(level: Level) {
    const [bareLvString, maxLvString] = level.split("/");
    const lvCap = +maxLvString;

    return {
      bareLv: +bareLvString,
      ascension: lvCap === 20 ? 0 : lvCap >= 90 ? 6 : lvCap / 10 - 3,
      lvCap,
    };
  }
}
