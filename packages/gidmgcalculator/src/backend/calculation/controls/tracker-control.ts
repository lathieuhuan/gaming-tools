import type {
  AttributeStat,
  AttackPatternPath,
  AttackElementPath,
  ReactionBonusPath,
  ResistanceReductionKey,
} from "@Src/backend/types";
import {
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  ATTACK_PATTERN_INFO_KEYS,
  ATTRIBUTE_STAT_TYPES,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
} from "@Src/backend/constants";
import { CalcItemRecord } from "../calculation.types";

type StatRecord = {
  desc: string;
  value: number;
};

type StatRecordCategory = "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus" | "resistReduct";

type StatRecordType =
  | AttributeStat
  | AttackPatternPath
  | AttackElementPath
  | ReactionBonusPath
  | ResistanceReductionKey;

type StatResult = Record<string, Record<string, StatRecord[]>>;

type CalcItemsResult = Record<string, Record<string, CalcItemRecord>>;

// #to-do: group StatRecord / CalcItemRecord
export type TrackerResult = {
  stats: StatResult;
  calcItems: CalcItemsResult;
};

export class TrackerControl {
  private stats: StatResult;
  private calcItems: CalcItemsResult;

  constructor() {
    this.stats = {
      totalAttr: {},
      attPattBonus: {},
      attElmtBonus: {},
      rxnBonus: {},
      resistReduct: {},
    };

    this.calcItems = {
      NAs: {},
      ES: {},
      EB: {},
      RXN: {},
      WP_CALC: {},
    };

    for (const stat of ATTRIBUTE_STAT_TYPES) {
      this.stats.totalAttr[stat] = [];
    }
    for (const attPatt of [...ATTACK_PATTERNS, "all"] as const) {
      for (const key of ATTACK_PATTERN_INFO_KEYS) {
        this.stats.attPattBonus[`${attPatt}.${key}`] = [];
      }
    }
    for (const attElmt of ATTACK_ELEMENTS) {
      for (const key of ATTACK_ELEMENT_INFO_KEYS) {
        this.stats.attElmtBonus[`${attElmt}.${key}`] = [];
      }
      this.stats.resistReduct[attElmt] = [];
    }
    this.stats.resistReduct.def = [];

    for (const reaction of REACTIONS) {
      for (const key of REACTION_BONUS_INFO_KEYS) {
        this.stats.rxnBonus[`${reaction}.${key}`] = [];
      }
    }
  }

  recordStat(category: "totalAttr", type: AttributeStat, value: number, description: string): void;
  recordStat(category: "attPattBonus", type: AttackPatternPath, value: number, description: string): void;
  recordStat(category: "attElmtBonus", type: AttackElementPath, value: number, description: string): void;
  recordStat(category: "rxnBonus", type: ReactionBonusPath, value: number, description: string): void;
  recordStat(category: "resistReduct", type: ResistanceReductionKey, value: number, description: string): void;
  recordStat(category: StatRecordCategory, type: StatRecordType, value: number, description: string) {
    const cateRecord = this.stats[category];
    const existed = cateRecord[type].find((record) => record.desc === description);

    if (existed) {
      existed.value += value;
      return;
    }
    cateRecord[type].push({ desc: description, value });
  }

  static initCalcItemRecord(initInfo: CalcItemRecord): CalcItemRecord {
    return initInfo;
  }

  recordCalcItem(category: "NAs" | "ES" | "EB" | "RXN" | "WP_CALC", name: string, record: CalcItemRecord) {
    this.calcItems[category][name] = record;
  }

  finalize(): TrackerResult {
    return {
      stats: this.stats,
      calcItems: this.calcItems,
    };
  }
}
