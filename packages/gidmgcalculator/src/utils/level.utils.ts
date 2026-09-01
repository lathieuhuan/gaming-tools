import type { Level } from "@/types";

export function splitLevel(level: Level) {
  const [bareLvString, maxLvString] = level.split("/");
  const lvCap = +maxLvString;

  return {
    bareLv: +bareLvString,
    ascension: lvCap === 20 ? 0 : lvCap >= 90 ? 6 : lvCap / 10 - 3,
    lvCap,
  };
}

export function parseLevel(level: Level, rarity: number) {
  const { bareLv, ascension } = splitLevel(level);

  if (rarity < 3 && ascension > 4) {
    return {
      level: "70/70" as Level,
      bareLv: 70,
      ascension: 4,
    };
  }

  return {
    level,
    bareLv,
    ascension,
  };
}

/**
 * @param allLvCaps should be sorted descending, e.g. [30, 20, 10]
 */
export function validCapsOfLevel(level: number, allLvCaps: number[]): number[] {
  // level 90 | 95 | 100 => return [90 | 95 | 100]
  if (level >= 90) {
    return [level];
  }

  for (const [index, lvCap] of allLvCaps.entries()) {
    // e.g. level = 20 => lvCap = 20
    // - If lvCap is first => return [lvCap=20]
    // - If not => return [the_cap_before=30, lvCap=20]
    if (lvCap === level) {
      return index ? [allLvCaps[index - 1], lvCap] : [lvCap];
    }
    // e.g. level = 25 => lvCap = 20 => return [the_cap_before=30]
    if (lvCap < level) {
      return [allLvCaps[index - 1]];
    }
  }

  const lastLvCap = allLvCaps[allLvCaps.length - 1];

  return [lastLvCap];
}
