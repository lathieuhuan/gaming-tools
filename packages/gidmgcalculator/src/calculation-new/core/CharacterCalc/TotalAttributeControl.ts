import type { AttributeBonus, AttributeStat, TotalAttributes } from "@/types";

import { ATTRIBUTE_STAT_TYPES } from "@/constants";
import Object_ from "@/utils/Object";
import TypeCounter, { TypeCounterKey } from "@/utils/TypeCounter";

export type TotalAttributeControlOptions = {
  initial?: InternalTotalAttribute;
  shouldRecord?: boolean;
};

export type TotalAttributeRecord = {
  label: string;
  value: number;
};

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    fixedBonus: number;
    dynamicBonus: number;
    records?: TotalAttributeRecord[];
  }
>;

export class TotalAttributeControl {
  private totalAttr: InternalTotalAttribute;
  readonly shouldRecord?: boolean;

  constructor(options: TotalAttributeControlOptions = {}) {
    const { initial, shouldRecord = false } = options;

    this.totalAttr = initial ?? this.init();
    this.shouldRecord = shouldRecord;
  }

  init() {
    this.totalAttr = {} as InternalTotalAttribute;

    for (const type of ATTRIBUTE_STAT_TYPES) {
      this.totalAttr[type] = {
        base: 0,
        fixedBonus: 0,
        dynamicBonus: 0,
      };
    }

    return this.totalAttr;
  }

  getRecords(key: AttributeStat) {
    return this.totalAttr[key].records || [];
  }

  private record(key: AttributeStat, value: number, label: string) {
    if (this.shouldRecord) {
      const attr = this.totalAttr[key];

      attr.records ||= [];
      attr.records.push({ label, value });
    }
  }

  addBase(key: AttributeStat, value: number, label = "Character base stat") {
    this.totalAttr[key].base += value;
    this.record(key, value, label);
  }

  applyBonus(bonus: AttributeBonus) {
    if (bonus.toStat === "base_atk" || bonus.toStat === "base_hp" || bonus.toStat === "base_def") {
      const statType = bonus.toStat.slice(5) as AttributeStat;
      this.addBase(statType, bonus.value, bonus.label);
      return;
    }

    if (bonus.isDynamic) {
      this.totalAttr[bonus.toStat].dynamicBonus += bonus.value;
    } else {
      this.totalAttr[bonus.toStat].fixedBonus += bonus.value;
    }

    this.record(bonus.toStat, bonus.value, bonus.label);
  }

  getBase(key: AttributeStat) {
    return this.totalAttr[key].base;
  }

  getTotal(key: AttributeStat | "base_atk", fixedOnly = false) {
    if (key === "base_atk") {
      return this.getBase("atk");
    }

    const base = this.totalAttr[key].base;
    let total = base + this.totalAttr[key].fixedBonus;

    if (!fixedOnly) {
      total += this.totalAttr[key].dynamicBonus;
    }

    if (isCoreStat(key)) {
      const percent = this.totalAttr[`${key}_`];
      let totalPercent = percent.base + percent.fixedBonus;

      if (!fixedOnly) {
        totalPercent += percent.dynamicBonus;
      }

      total += (base * totalPercent) / 100;
    }

    return total;
  }

  finalize() {
    const totalAttrs = new TypeCounter<TypeCounterKey<TotalAttributes>>();

    for (const key of ATTRIBUTE_STAT_TYPES) {
      if (key === "hp_" || key === "atk_" || key === "def_") {
        continue;
      }

      if (isCoreStat(key)) {
        totalAttrs.add(`base_${key}`, this.totalAttr[key].base);
      }

      totalAttrs.add(key, this.getTotal(key));
    }

    return totalAttrs;
  }

  clone() {
    return new TotalAttributeControl({
      initial: Object_.clone(this.totalAttr),
      shouldRecord: this.shouldRecord,
    });
  }
}

function isCoreStat(key: string) {
  return key === "hp" || key === "atk" || key === "def";
}
