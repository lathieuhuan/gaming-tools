import type { BaseAttributeStat, CoreStat } from "@/types";

import { BASE_ATTRIBUTE_STATS, CORE_STAT_TYPES } from "@/constants/global";

export function limitCRate(crit: number) {
  return Math.min(Math.max(crit, 0), 100);
}

export function isBaseStat(key: string): key is BaseAttributeStat {
  return BASE_ATTRIBUTE_STATS.includes(key as BaseAttributeStat);
}

export function isCoreStat(key: string): key is CoreStat {
  return CORE_STAT_TYPES.includes(key as CoreStat);
}

export function baseStatToCoreStat(key: BaseAttributeStat): CoreStat {
  switch (key) {
    case "base_atk":
      return "atk";
    case "base_hp":
      return "hp";
    case "base_def":
      return "def";
    default:
      console.error(`Invalid base stat: ${key}`);
      return "atk";
  }
}
