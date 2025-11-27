import type { Level } from "@/types";

export class Ascendable {
  bareLv: number;
  ascension: number;

  constructor(level: Level) {
    const [bareLvString, maxLvString] = level.split("/");
    const maxLv = +maxLvString;

    this.bareLv = +bareLvString;
    this.ascension = maxLv === 20 ? 0 : maxLv >= 90 ? 6 : maxLv / 10 - 3;
  }
}
