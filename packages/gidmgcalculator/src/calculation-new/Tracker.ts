import type {
  AttackBonusKey,
  AttributeStat,
  CalcItemType,
  CalculationFinalResultKey,
  LunarType,
  ResistReductionKey,
} from "@/calculation/types";

import { ATTACK_ELEMENTS, ATTRIBUTE_STAT_TYPES } from "@/calculation/constants";
import { ECalcStatModule } from "@/calculation/constants/internal";

// ========== STAT RECORD ==========

export type CalcAtomicRecord = {
  description: string;
  value: number;
};

type StatRecordGroup = Record<string, CalcAtomicRecord[]>;

type StatsRecords = Record<ECalcStatModule, StatRecordGroup>;

// ========== CALC ITEM RECORD ==========

export type CalcItemExclusiveBonus = {
  type: AttackBonusKey;
  records: CalcAtomicRecord[];
};

export type CalcItemRecord = {
  itemType: CalcItemType;
  specialPatt?: LunarType;
  factors: Array<{
    desc: string;
    value: number;
    talentMult?: number;
  }>;
  coefficient?: number;
  baseMult?: number;
  totalFlat?: number;
  elvMult?: number;
  specMult?: number;
  bonusMult: number;
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

export class TrackerC {
  [ECalcStatModule.ATTR]: StatRecordGroup = {};
  [ECalcStatModule.RESIST]: StatRecordGroup = {};
  // private calcItems: CalcItemsRecord;

  constructor() {
    for (const stat of ATTRIBUTE_STAT_TYPES) {
      this[ECalcStatModule.ATTR][stat] = [];
    }

    for (const attElmt of ATTACK_ELEMENTS) {
      this[ECalcStatModule.RESIST][attElmt] = [];
    }
    this[ECalcStatModule.RESIST].def = [];
  }

  recordATTR(type: AttributeStat, value: number, description: string) {
    const records = this[ECalcStatModule.ATTR][type];
    const existed = records.find((record) => record.description === description);

    if (existed) {
      existed.value += value;
    } else {
      records.push({ value, description });
    }
  }

  recordRESIST(type: ResistReductionKey, value: number, description: string) {
    const records = this[ECalcStatModule.RESIST][type];
    const existed = records.find((record) => record.description === description);

    if (existed) {
      existed.value += value;
    } else {
      records.push({ value, description });
    }
  }

  // finalize(): TrackerResult {
  //   return Object.assign({}, this.stats, this.calcItems);
  // }
}
