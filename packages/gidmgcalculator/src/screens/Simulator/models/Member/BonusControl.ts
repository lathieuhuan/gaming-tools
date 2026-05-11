import type {
  AllAttributeStat,
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  LevelableTalentType,
  TalentCalcItemBonusId,
} from "@/types";
import type {
  AttackBonus,
  AttributeBonus,
  Bonus,
  BonusGroup,
  BonusGroupId,
  BonusGroupMeta,
  TalentLevelBonus,
} from "./types";

type InternalBonusGroup = BonusGroup & {
  ids: Set<string>;
};

type BonusGroupsById = Map<BonusGroupId, InternalBonusGroup>;

export type GetBonusPaths = Array<AttackBonusType | null | undefined | false>;

type TalentLvBonusRecord = Partial<Record<LevelableTalentType, TalentLevelBonus[]>>;

type AttributeBonusRecord = Partial<Record<AllAttributeStat, AttributeBonus[]>>;

type AttackBonusRecord = Partial<Record<AttackBonusType, AttackBonus[]>>;

export class BonusControl {
  innateGroups: BonusGroupsById = new Map();
  groups: BonusGroupsById = new Map();

  tllvRecord: TalentLvBonusRecord = {};
  attrRecord: AttributeBonusRecord = {};
  attkRecord: AttackBonusRecord = {};

  static bonusId(bonus: Bonus) {
    switch (bonus.type) {
      case "TLLV":
        return `${bonus.groupId}-TL-${bonus.toType}`;
      case "ATTR":
        return `${bonus.groupId}-${bonus.toStat}`;
      case "ATTK":
        return `${bonus.groupId}-${bonus.toType}-${bonus.toKey}`;
      default:
        bonus satisfies never;
        return "";
    }
  }

  // ===== ARRANGE BONUSES =====

  private updateTllvBonus(bonus: TalentLevelBonus) {
    const current = this.tllvRecord[bonus.toType] || [];
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

    this.tllvRecord[bonus.toType] = current;
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

  private arrangeBonus(bonus: Bonus) {
    switch (bonus.type) {
      case "TLLV":
        this.updateTllvBonus(bonus);
        break;
      case "ATTR":
        this.updateAttrBonus(bonus);
        break;
      case "ATTK":
        this.updateAttkBonus(bonus);
        break;
      default:
        bonus satisfies never;
        break;
    }
  }

  // ===== INNATE BONUSES =====

  /** Does not add if bonus already exists by id (constructed from bonus object) */
  addInnateBonus(meta: BonusGroupMeta, bonus: Bonus) {
    const id = BonusControl.bonusId(bonus);
    const current = this.innateGroups.get(meta.id) || { meta, ids: new Set(), bonuses: [] };

    if (current.ids.has(id)) {
      return;
    }

    current.ids.add(id);
    current.bonuses.push(bonus);
    this.innateGroups.set(meta.id, current);
    this.arrangeBonus(bonus);
  }

  /** Replace existing group if any */
  addInnateBonusGroup(group: BonusGroup) {
    if (group.bonuses.length === 0) {
      return;
    }

    const bonusIds = new Set<string>();
    const bonuses: Bonus[] = [];

    for (const bonus of group.bonuses) {
      const bonusId = BonusControl.bonusId(bonus);

      if (bonusIds.has(bonusId)) {
        continue;
      }

      bonusIds.add(bonusId);
      bonuses.push(bonus);
      this.arrangeBonus(bonus);
    }

    if (bonusIds.size === 0) {
      return;
    }

    this.innateGroups.set(group.meta.id, {
      meta: group.meta,
      ids: bonusIds,
      bonuses,
    });
  }

  // ===== BONUSES =====

  private _add(meta: BonusGroupMeta, bonus: Bonus) {
    const id = BonusControl.bonusId(bonus);
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

  // ===== GETTERS =====

  totalTllvBonus(type: LevelableTalentType) {
    const bonuses = this.tllvRecord[type] || [];

    return bonuses.reduce((total, bonus) => total + bonus.value, 0);
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

  reset() {
    this.groups.clear();
    this.attrRecord = {};
    this.attkRecord = {};

    for (const group of this.innateGroups.values()) {
      for (const bonus of group.bonuses) {
        this.arrangeBonus(bonus);
      }
    }
  }
}
