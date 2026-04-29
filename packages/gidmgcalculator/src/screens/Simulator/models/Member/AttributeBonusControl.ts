import type { AttributeStat, BaseAttributeStat } from "@/types";
import type { AttributeBonus, BonusGroupId, BonusGroupMeta } from "./types";

type AttributeBonusStat = AttributeStat | BaseAttributeStat;

type BonusByType = Partial<Record<AttributeBonusStat, AttributeBonus[]>>;

type BonusData = {
  meta: BonusGroupMeta;
  bonuses: AttributeBonus[];
};

type BonusByGroupId = Map<BonusGroupId, BonusData>;

export class AttributeBonusControl {
  private byType: BonusByType = {};
  private byGroupId: BonusByGroupId = new Map();

  get records() {
    return this.byGroupId;
  }

  add(meta: BonusGroupMeta, bonuses: AttributeBonus[]) {
    if (this.byGroupId.has(meta.id)) {
      this.remove(meta.id);
    }

    this.byGroupId.set(meta.id, { meta, bonuses });

    for (const bonus of bonuses) {
      const current = this.byType[bonus.toStat] || [];

      current.push(bonus);
      this.byType[bonus.toStat] = current;
    }
  }

  get(key: AttributeBonusStat) {
    const bonuses = this.byType[key] || [];

    return bonuses.reduce((total, bonus) => total + bonus.value, 0);
  }

  remove(groupId: BonusGroupId) {
    const data = this.byGroupId.get(groupId);

    if (!data?.bonuses.length) {
      this.byGroupId.delete(groupId);
      return false;
    }

    for (const bonus of data.bonuses) {
      const current = this.byType[bonus.toStat] || [];

      this.byType[bonus.toStat] = current.filter((b) => b.groupId !== groupId);
    }

    this.byGroupId.delete(groupId);

    return true;
  }

  clone() {
    const copy = new AttributeBonusControl();

    for (const { meta, bonuses } of this.byGroupId.values()) {
      copy.add(meta, bonuses);
    }

    return copy;
  }
}
