import type { PartiallyOptional } from "rond";
import type { AppliedAttackBonus, AttackBonusKey, AttackBonusType, CalcItem } from "../types";
import type { CalcItemExclusiveBonus } from "./tracker-control";
import { toArray } from "@Src/utils";

type AttackBonusRecord = {
  desc: string;
  value: number;
  to: AttackBonusKey;
};

export type AttackBonuses = Array<{
  type: AttackBonusType;
  records: AttackBonusRecord[];
}>;

/** should not use 'all' in AttackBonusType */
type GetBonusPaths = Array<AttackBonusType | undefined>;

type BonusToAdd = PartiallyOptional<AppliedAttackBonus, "id">;

export class AttackBonusesControl {
  private attBonuses: AttackBonuses = [];

  private finalizedBonusAll = false;
  private attackBonusAll: Partial<Record<AttackBonusKey, number>> = {};

  add = (bonuses: BonusToAdd | BonusToAdd[]) => {
    for (const bonus of toArray(bonuses)) {
      if (bonus.value) {
        const existedBonus = this.attBonuses.find((existBonus) => existBonus.type === bonus.toType);
        const record: AttackBonusRecord = {
          desc: bonus.description,
          value: bonus.value,
          to: bonus.toKey,
        };

        if (existedBonus) {
          existedBonus.records.push(record);
        } else {
          this.attBonuses.push({
            type: bonus.toType,
            records: [record],
          });
        }
      }
    }
  };

  private finalizeBonusAll = () => {
    for (const bonus of this.attBonuses) {
      if (bonus.type === "all") {
        for (const record of bonus.records) {
          this.attackBonusAll[record.to] = (this.attackBonusAll[record.to] ?? 0) + record.value;
        }
      }
    }
  };

  static get = (attBonuses: AttackBonuses, path: AttackBonusKey, ...paths: GetBonusPaths) => {
    let result = 0;

    for (const bonus of attBonuses) {
      if (paths.some((path) => path && bonus.type === path)) {
        for (const record of bonus.records) {
          if (record.to === path) {
            result += record.value;
          }
        }
      }
    }
    return result;
  };

  get = (key: AttackBonusKey, ...paths: GetBonusPaths) => {
    if (!this.finalizedBonusAll) {
      this.finalizeBonusAll();
      this.finalizedBonusAll = true;
    }

    return (this.attackBonusAll[key] ?? 0) + AttackBonusesControl.get(this.attBonuses, key, ...paths);
  };

  getBare = (key: AttackBonusKey, ...paths: GetBonusPaths) => {
    return AttackBonusesControl.get(this.attBonuses, key, ...paths);
  };

  getExclusiveBonuses = (item: CalcItem): CalcItemExclusiveBonus[] => {
    const filterRecords: CalcItemExclusiveBonus[] = [];
    const bonusRecords = item.id ? this.attBonuses.find((bonus) => bonus.type === item.id)?.records || [] : [];

    for (const record of bonusRecords) {
      const existed = filterRecords.find((filterRecord) => filterRecord.type === record.to);
      const newRecord = {
        value: record.value,
        desc: record.desc,
      };

      if (existed) {
        existed.records.push(newRecord);
      } else {
        filterRecords.push({
          type: record.to,
          records: [newRecord],
        });
      }
    }
    return filterRecords;
  };

  serialize = () => ([] as AttackBonuses).concat(this.attBonuses);
}
