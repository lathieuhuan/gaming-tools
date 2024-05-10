import type {
  AttributeStat,
  ReactionBonusPath,
  ResistanceReductionKey,
  CalcItemType,
  BonusKey,
} from "@Src/backend/types";

import { ATTACK_ELEMENTS, ATTRIBUTE_STAT_TYPES, REACTIONS, REACTION_BONUS_INFO_KEYS } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal.constants";
import { CalculationFinalResultKey } from "../calculation.types";

// ========== STAT RECORD ==========

export type CalcStatRecord = {
  desc: string;
  value: number;
};

type StatRecordType = AttributeStat | ReactionBonusPath | ResistanceReductionKey;

type StatRecordGroup = Record<string, CalcStatRecord[]>;

type StatsRecords = Record<ECalcStatModule, StatRecordGroup>;

// ========== CALC ITEM RECORD ==========

export type CalcItemBonus = Partial<Record<BonusKey, { desc: string; value: number }>>;

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
  exclusives?: CalcItemBonus[];
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
      [ECalcStatModule.RXN]: {},
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

    for (const reaction of REACTIONS) {
      for (const key of REACTION_BONUS_INFO_KEYS) {
        this.stats.RXN[`${reaction}.${key}`] = [];
      }
    }
  }

  recordStat(category: ECalcStatModule.ATTR, type: AttributeStat, value: number, description: string): void;
  recordStat(category: ECalcStatModule.RXN, type: ReactionBonusPath, value: number, description: string): void;
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
