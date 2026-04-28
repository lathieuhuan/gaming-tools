import type { AttackBonusKey, AttackBonusType } from "@/types";
import type {
  AttackBonus,
  AttributeBonus,
  AttributeBonusStat,
  Bonus,
  BonusGroupId,
  BonusGroupMeta,
} from "./types";

type BonusData = {
  meta: BonusGroupMeta;
  bonuses: Bonus[];
};

type BonusByGroupId = Map<BonusGroupId, BonusData>;

export type GetBonusPaths = Array<AttackBonusType | null | undefined | false>;

export class BonusControl {
  groups: BonusByGroupId = new Map();

  private attrRecord: Partial<Record<AttributeBonusStat, AttributeBonus[]>> = {};
  private attkRecord: Partial<Record<AttackBonusType, AttackBonus[]>> = {};

  private updateAttrBonus(bonus: AttributeBonus) {
    const current = this.attrRecord[bonus.toStat] || [];
    let updated = false;

    for (const item of current) {
      if (item.groupId === bonus.groupId) {
        item.value = bonus.value;
        updated = true;
        break;
      }
    }

    if (!updated) {
      current.push(bonus);
    }

    this.attrRecord[bonus.toStat] = current;
  }

  private updateAttkBonus(bonus: AttackBonus) {
    const current = this.attkRecord[bonus.toType] || [];
    let updated = false;

    for (const item of current) {
      if (item.groupId === bonus.groupId && item.toKey === bonus.toKey) {
        item.value = bonus.value;
        updated = true;
        break;
      }
    }

    if (!updated) {
      current.push(bonus);
    }

    this.attkRecord[bonus.toType] = current;
  }

  private _add(meta: BonusGroupMeta, bonus: AttackBonus | AttributeBonus) {
    const current = this.groups.get(meta.id) || { meta, bonuses: [] };

    current.bonuses.push(bonus);
    this.groups.set(meta.id, current);
  }

  addAttrBonus(meta: BonusGroupMeta, bonus: AttributeBonus) {
    this._add(meta, bonus);
    this.updateAttrBonus(bonus);
  }

  /** Update if already exists */
  addAttkBonus(meta: BonusGroupMeta, bonus: AttackBonus) {
    this._add(meta, bonus);
    this.updateAttkBonus(bonus);
  }

  totalAttkBonus(key: AttackBonusKey, paths: GetBonusPaths) {
    let result = 0;

    for (const path of paths) {
      const bonuses = (path && this.attkRecord[path]) || [];

      result += bonuses.reduce((total, bonus) => {
        return total + (bonus.toKey === key ? bonus.value : 0);
      }, 0);
    }

    return result;
  }
}
