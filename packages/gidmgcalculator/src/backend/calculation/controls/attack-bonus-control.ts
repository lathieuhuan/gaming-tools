import type {
  ActualAttackPattern,
  AttackBonusType,
  AttackElement,
  BonusKey,
  CalcItem,
  ExclusiveBonusType,
  ReactionType,
} from "@Src/backend/types";
import { CalcItemExclusiveBonus } from "./tracker-control";

type AttackBonusRecord = {
  desc: string;
  value: number;
  to: BonusKey;
};

export type AttackBonus = Array<{
  type: AttackBonusType;
  records: AttackBonusRecord[];
}>;

// Array of AttackBonusType's segments
type GetBonusPaths = Array<ActualAttackPattern | AttackElement | ReactionType | ExclusiveBonusType | undefined>;

export class AttackBonusControl {
  private attBonus: AttackBonus = [];

  private finalizedBonusAll = false;
  private attackBonusAll: Partial<Record<BonusKey, number>> = {};

  add = (module: AttackBonusType, path: BonusKey, value: number, description: string) => {
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

  static getBonus = (attBonus: AttackBonus, path: BonusKey, ...paths: GetBonusPaths) => {
    let result = 0;

    for (const bonus of attBonus) {
      if (paths.some((path) => path && bonus.type.includes(path))) {
        for (const record of bonus.records) {
          if (record.to === path) {
            result += record.value;
          }
        }
      }
    }
    return result;
  };

  get = (key: BonusKey, ...paths: GetBonusPaths) => {
    if (!this.finalizedBonusAll) {
      this.finalizeBonusAll();
      this.finalizedBonusAll = true;
    }

    return (this.attackBonusAll[key] ?? 0) + AttackBonusControl.getBonus(this.attBonus, key, ...paths);
  };

  getExclusiveBonuses = (item: CalcItem): CalcItemExclusiveBonus[] => {
    const filterRecords: CalcItemExclusiveBonus[] = [];
    const foundBonus = item.id ? this.attBonus.find((bonus) => bonus.type === item.id) : undefined;

    if (foundBonus) {
      for (const record of foundBonus.records) {
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
    }
    return filterRecords;
  };

  serialize = () => [...this.attBonus];
}
