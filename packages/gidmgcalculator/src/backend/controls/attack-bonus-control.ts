import type { AttackBonusKey, AttackBonusType, CalcItem } from "../types";
import type { CalcItemExclusiveBonus } from "./tracker-control";

type AttackBonusRecord = {
  desc: string;
  value: number;
  to: AttackBonusKey;
};

export type AttackBonus = Array<{
  type: AttackBonusType;
  records: AttackBonusRecord[];
}>;

/** should not use 'all' in AttackBonusType */
type GetBonusPaths = Array<AttackBonusType | undefined>;

export class AttackBonusControl {
  private attBonus: AttackBonus = [];

  private finalizedBonusAll = false;
  private attackBonusAll: Partial<Record<AttackBonusKey, number>> = {};

  add = (module: AttackBonusType, path: AttackBonusKey, value: number, description: string) => {
    if (value) {
      const existedBonus = this.attBonus.find((bonus) => bonus.type === module);
      const record: AttackBonusRecord = {
        desc: description,
        value,
        to: path,
      };

      if (existedBonus) {
        existedBonus.records.push(record);
      } else {
        this.attBonus.push({
          type: module,
          records: [record],
        });
      }
    }
  };

  private finalizeBonusAll = () => {
    for (const bonus of this.attBonus) {
      if (bonus.type === "all") {
        for (const record of bonus.records) {
          this.attackBonusAll[record.to] = (this.attackBonusAll[record.to] ?? 0) + record.value;
        }
      }
    }
  };

  static getBonus = (attBonus: AttackBonus, path: AttackBonusKey, ...paths: GetBonusPaths) => {
    let result = 0;

    for (const bonus of attBonus) {
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

    return (this.attackBonusAll[key] ?? 0) + AttackBonusControl.getBonus(this.attBonus, key, ...paths);
  };

  getBare = (key: AttackBonusKey, ...paths: GetBonusPaths) => {
    return AttackBonusControl.getBonus(this.attBonus, key, ...paths);
  };

  getExclusiveBonuses = (item: CalcItem): CalcItemExclusiveBonus[] => {
    const filterRecords: CalcItemExclusiveBonus[] = [];
    const bonusRecords = item.id ? this.attBonus.find((bonus) => bonus.type === item.id)?.records || [] : [];

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

  serialize = () => ([] as AttackBonus).concat(this.attBonus);
}
