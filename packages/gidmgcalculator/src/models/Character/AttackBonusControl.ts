import type {
  AttackBonus,
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  TalentCalcItemBonusId,
} from "@/types";

export type GetBonusPaths = Array<AttackBonusType | null | undefined | false>;

export type GetBonusOptions = {
  filter?: (bonus: AttackBonus) => boolean;
};

const defaultFilter = () => true;

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

  get(key: AttackBonusKey, paths: GetBonusPaths, options: GetBonusOptions = {}) {
    const { filter = defaultFilter } = options;
    let result = 0;

    for (const path of paths) {
      const bonuses = (path && this.records.get(path)) || [];

      result += bonuses.reduce((total, bonus) => {
        return total + (bonus.toKey === key && filter(bonus) ? bonus.value : 0);
      }, 0);
    }

    return result;
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
