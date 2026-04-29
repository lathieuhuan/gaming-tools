import type {
  AllAttributeStat,
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  TalentCalcItemBonusId,
} from "@/types";
import type {
  AttackBonus,
  AttackBonusRecord,
  AttributeBonus,
  AttributeBonusRecord,
  Bonus,
  BonusGroupId,
  BonusGroupMeta,
} from "./types";

type BonusData = {
  meta: BonusGroupMeta;
  ids: Set<string>;
  bonuses: Bonus[];
};

type BonusByGroupId = Map<BonusGroupId, BonusData>;

export type GetBonusPaths = Array<AttackBonusType | null | undefined | false>;

export class BonusControl {
  groups: BonusByGroupId = new Map();

  private attrRecord: AttributeBonusRecord = {};
  private attkRecord: AttackBonusRecord = {};

  get attrRecords() {
    return this.attrRecord;
  }

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
    const id = bonusId(bonus);
    const current = this.groups.get(meta.id) || { meta, ids: new Set(), bonuses: [] };

    if (current.ids.has(id)) {
      return;
    }

    current.ids.add(id);
    current.bonuses.push(bonus);
    this.groups.set(meta.id, current);
  }

  /** Update if already exists */
  addAttrBonus(meta: BonusGroupMeta, bonus: AttributeBonus) {
    bonus = { ...bonus };

    this._add(meta, bonus);
    this.updateAttrBonus(bonus);
  }

  /** Update if already exists */
  addAttkBonus(meta: BonusGroupMeta, bonus: AttackBonus) {
    bonus = { ...bonus };

    this._add(meta, bonus);
    this.updateAttkBonus(bonus);
  }

  totalAttrBonus(key: AllAttributeStat, fixedOnly = true) {
    const bonuses = this.attrRecord[key] || [];

    return bonuses.reduce(
      (total, bonus) => total + (bonus.isDynamic && fixedOnly ? 0 : bonus.value),
      0
    );
  }

  totalAttkBonus(key: AttackBonusKey, paths: GetBonusPaths) {
    return paths.reduce((total, path) => {
      const bonuses = (path && this.attkRecord[path]) || [];
      const pathTotal = bonuses.reduce(
        (total, bonus) => total + (bonus.toKey === key ? bonus.value : 0),
        0
      );

      return total + pathTotal;
    }, 0);
  }

  collectExclusiveBonuses = (id?: TalentCalcItemBonusId) => {
    const result: ExclusiveAttackBonusGroup[] = [];
    const bonusRecords = (id && this.attkRecord[id]) || [];

    for (const record of bonusRecords) {
      const existed = result.find((filterRecord) => filterRecord.type === record.toKey);
      const newRecord: ExclusiveAttackBonus = {
        value: record.value,
        label: "record.label", // TODO
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
}

function bonusId(bonus: AttributeBonus | AttackBonus) {
  switch (bonus.type) {
    case "ATTR":
      return `${bonus.groupId}-${bonus.toStat}`;
    case "ATTK":
      return `${bonus.groupId}-${bonus.toType}-${bonus.toKey}`;
    default:
      bonus satisfies never;
      return "";
  }
}
