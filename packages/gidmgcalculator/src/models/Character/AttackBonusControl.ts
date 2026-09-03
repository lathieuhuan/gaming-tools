import type {
  AttackBonus,
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  TalentCalcItemBonusId,
} from "@/types";

export type GetAttackBonusPaths = Array<AttackBonusType | null | undefined | false>;

export class AttackBonusControl {
  private constructor(public records: Map<AttackBonusType, AttackBonus[]>) {}

  static create() {
    return new AttackBonusControl(new Map());
  }

  add(bonus: AttackBonus) {
    const bonuses = this.records.get(bonus.toType) || [];

    bonuses.push(bonus);
    this.records.set(bonus.toType, bonuses);

    return this;
  }

  get(key: AttackBonusKey, paths: AttackBonusType | GetAttackBonusPaths) {
    if (typeof paths === "string") {
      paths = [paths];
    }

    return paths.reduce((total, path) => {
      const bonuses = (path && this.records.get(path)) || [];

      const totalByKey = bonuses.reduce((total, bonus) => {
        return total + (bonus.toKey === key ? bonus.value : 0);
      }, 0);

      return total + totalByKey;
    }, 0);
  }

  exclusiveGroups = (id?: TalentCalcItemBonusId) => {
    const result: ExclusiveAttackBonusGroup[] = [];
    const bonusRecords = (id && this.records.get(id)) || [];

    for (const record of bonusRecords) {
      const existed = result.find((filterRecord) => filterRecord.type === record.toKey);
      const newRecord: ExclusiveAttackBonus = {
        value: record.value,
        label: record.label,
      };

      if (existed) {
        existed.items.push(newRecord);
      } else {
        result.push({
          type: record.toKey,
          items: [newRecord],
        });
      }
    }

    return result;
  };

  clone() {
    return new AttackBonusControl(this.records);
  }

  clear() {
    this.records = new Map();
    return this;
  }
}
