import type {
  AttackBonus,
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  TalentCalcItemBonusId,
} from "@/types";

import Object_ from "@/utils/Object";

type AttackBonusGroup = Record<AttackBonusType, AttackBonus[]>;

type GetBonusPaths = Array<AttackBonusType | null | undefined | false>;

export class AttackBonusControl {
  protected group = {} as AttackBonusGroup;
  protected initial = {} as AttackBonusGroup;

  constructor(initial: Partial<AttackBonusGroup> = {}) {
    this.initial = Object_.cloneProps(initial) as AttackBonusGroup;
    this.group = initial as AttackBonusGroup;
  }

  get records() {
    return this.group;
  }

  add(bonus: AttackBonus) {
    const current = this.group[bonus.toType] || [];
    current.push(bonus);
    this.group[bonus.toType] = current;

    return this;
  }

  get(key: AttackBonusKey, ...paths: GetBonusPaths) {
    let result = 0;

    for (const path of paths) {
      const bonuses = (path && this.group[path]) || [];

      result += bonuses.reduce((total, bonus) => {
        return total + (bonus.toKey === key ? bonus.value : 0);
      }, 0);
    }

    return result;
  }

  collectExclusiveBonuses = (id?: TalentCalcItemBonusId) => {
    const result: ExclusiveAttackBonusGroup[] = [];
    const bonusRecords = (id && this.group[id]) || [];

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
    return new AttackBonusControl(Object_.cloneProps(this.group));
  }

  reset() {
    this.group = Object_.cloneProps(this.initial);
    return this;
  }

  clear() {
    this.group = {} as AttackBonusGroup;
    return this;
  }
}
