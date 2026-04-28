import type {
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  TalentCalcItemBonusId,
} from "@/types";

export type AttackBonusGroupId = number;

export type AttackBonus = {
  groupId: AttackBonusGroupId;
  value: number;
  toType: AttackBonusType;
  toKey: AttackBonusKey;
  label: string;
};

type BonusByType = Partial<Record<AttackBonusType, AttackBonus[]>>;

type BonusByGroupId = Map<AttackBonusGroupId, AttackBonus[]>;

export type GetBonusPaths = Array<AttackBonusType | null | undefined | false>;

export type GetBonusOptions = {
  filter?: (bonus: AttackBonus) => boolean;
};

const defaultFilter = () => true;

export class AttackBonusControl {
  private byType: BonusByType = {};
  private byGroupId: BonusByGroupId = new Map();

  get records() {
    return this.byGroupId;
  }

  add(groupId: AttackBonusGroupId, bonuses: AttackBonus[]) {
    if (this.byGroupId.has(groupId)) {
      this.remove(groupId);
    }

    this.byGroupId.set(groupId, bonuses);

    for (const bonus of bonuses) {
      const current = this.byType[bonus.toType] || [];

      current.push(bonus);
      this.byType[bonus.toType] = current;
    }
  }

  get(key: AttackBonusKey, paths: GetBonusPaths, options: GetBonusOptions = {}) {
    const { filter = defaultFilter } = options;
    let result = 0;

    for (const path of paths) {
      const bonuses = (path && this.byType[path]) || [];

      result += bonuses.reduce((total, bonus) => {
        return total + (bonus.toKey === key && filter(bonus) ? bonus.value : 0);
      }, 0);
    }

    return result;
  }

  remove(groupId: number) {
    const bonuses = this.byGroupId.get(groupId);

    if (!bonuses?.length) {
      this.byGroupId.delete(groupId);
      return false;
    }

    for (const bonus of bonuses) {
      const current = this.byType[bonus.toType] || [];

      this.byType[bonus.toType] = current.filter((b) => b.groupId !== groupId);
    }

    this.byGroupId.delete(groupId);

    return true;
  }

  collectExclusiveBonuses = (id?: TalentCalcItemBonusId) => {
    const result: ExclusiveAttackBonusGroup[] = [];
    const bonusRecords = (id && this.byType[id]) || [];

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
    const copy = new AttackBonusControl();

    for (const [groupId, bonuses] of this.byGroupId) {
      copy.add(groupId, bonuses);
    }

    return copy;
  }
}
