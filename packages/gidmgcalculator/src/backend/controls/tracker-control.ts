import type {
  AttributeStat,
  ResistanceReductionKey,
  CalcItemType,
  AttackBonusKey,
  LevelableTalentType,
} from "@Src/backend/types";

import { ATTACK_ELEMENTS, ATTRIBUTE_STAT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";

export type CalculationFinalResultKey = LevelableTalentType | "RXN_CALC" | "WP_CALC";

// ========== STAT RECORD ==========

export type CalcAtomicRecord = {
  desc: string;
  value: number;
};

type StatRecordType = AttributeStat | ResistanceReductionKey;

type StatRecordGroup = Record<string, CalcAtomicRecord[]>;

type StatsRecords = Record<ECalcStatModule, StatRecordGroup>;

// ========== CALC ITEM RECORD ==========

export type CalcItemExclusiveBonus = {
  type: AttackBonusKey;
  records: CalcAtomicRecord[];
};

export type CalcItemRecord = {
  itemType: CalcItemType;
  multFactors: Array<{
    desc: string;
    value: number;
    talentMult?: number;
  }>;
  totalFlat?: number;
  normalMult: number;
  specialMult?: number;
  rxnMult?: number;
  defMult?: number;
  resMult?: number;
  cRate_?: number;
  cDmg_?: number;
  note?: string;
  exclusives?: CalcItemExclusiveBonus[];
};

type CalcItemRecordGroup = Record<string, CalcItemRecord>;

type CalcItemsRecord = Record<CalculationFinalResultKey, CalcItemRecordGroup>;

export type TrackerResult = StatsRecords & CalcItemsRecord;

export class TrackerControl {
  private stats: StatsRecords;
  private calcItems: CalcItemsRecord;

  constructor() {
    this.stats = {
      [ECalcStatModule.ATTR]: {},
      [ECalcStatModule.RESIST]: {},
    };

    this.calcItems = {
      NAs: {},
      ES: {},
      EB: {},
      RXN_CALC: {},
      WP_CALC: {},
    };

    for (const stat of ATTRIBUTE_STAT_TYPES) {
      this.stats.ATTR[stat] = [];
    }

    for (const attElmt of ATTACK_ELEMENTS) {
      this.stats.RESIST[attElmt] = [];
    }
    this.stats.RESIST.def = [];
  }

  recordStat(category: ECalcStatModule.ATTR, type: AttributeStat, value: number, description: string): void;
  recordStat(category: ECalcStatModule.RESIST, type: ResistanceReductionKey, value: number, description: string): void;
  recordStat(category: ECalcStatModule, type: StatRecordType, value: number, description: string) {
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

  recordCalcItem(category: "NAs" | "ES" | "EB" | "RXN_CALC" | "WP_CALC", name: string, record: CalcItemRecord) {
    this.calcItems[category][name] = record;
  }

  finalize(): TrackerResult {
    return {
      ...this.stats,
      ...this.calcItems,
    };
  }
}
