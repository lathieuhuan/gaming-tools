import type {
  AllAttributeStat,
  AttackBonusKey,
  AttackBonusType,
  ExclusiveAttackBonus,
  ExclusiveAttackBonusGroup,
  LevelableTalentType,
  TalentCalcItemBonusId,
} from "@/types";
import type { AttackBonus, AttributeBonus, Bonus, TalentLevelBonus } from "./types";

export type GetAttackBonusPaths = Array<AttackBonusType | null | undefined | false>;

type TalentLvBonusRecord = Map<LevelableTalentType, TalentLevelBonus[]>;

type AttributeBonusRecord = Map<AllAttributeStat, AttributeBonus[]>;

type AttackBonusRecord = Map<AttackBonusType, AttackBonus[]>;

export class BonusControl {
  tllvRecord: TalentLvBonusRecord = new Map();
  attrRecord: AttributeBonusRecord = new Map();
  attkRecord: AttackBonusRecord = new Map();

  add(bonus: Bonus) {
    switch (bonus.type) {
      case "TLLV": {
        const current = this.tllvRecord.get(bonus.toType) || [];

        current.push(bonus);
        this.tllvRecord.set(bonus.toType, current);
        break;
      }
      case "ATTR": {
        const current = this.attrRecord.get(bonus.toStat) || [];

        current.push(bonus);
        this.attrRecord.set(bonus.toStat, current);
        break;
      }
      case "ATTK": {
        const current = this.attkRecord.get(bonus.toType) || [];

        current.push(bonus);
        this.attkRecord.set(bonus.toType, current);
        break;
      }
    }
  }

  // ===== GETTERS =====

  totalTllvBonus(type: LevelableTalentType) {
    const bonuses = this.tllvRecord.get(type);
    return bonuses?.reduce((total, bonus) => total + bonus.value, 0) || 0;
  }

  private accumulateAttrBonuses(fixedOnly: boolean) {
    return (total: number, bonus: AttributeBonus) => {
      return total + (bonus.isDynamic && fixedOnly ? 0 : bonus.value);
    };
  }

  totalAttrBonus(key: AllAttributeStat, fixedOnly = true) {
    const bonuses = this.attrRecord.get(key);
    return bonuses?.reduce(this.accumulateAttrBonuses(fixedOnly), 0) || 0;
  }

  private accumulateAttkBonuses(key: AttackBonusKey) {
    return (total: number, bonus: AttackBonus) => {
      return total + (bonus.toKey === key ? bonus.value : 0);
    };
  }

  totalAttkBonus(key: AttackBonusKey, paths: GetAttackBonusPaths) {
    return paths.reduce((total, path) => {
      const bonuses = (path && this.attkRecord.get(path)) || [];
      const pathTotal = bonuses.reduce(this.accumulateAttkBonuses(key), 0);

      return total + pathTotal;
    }, 0);
  }

  exclusiveAttkBonusGroups(id?: TalentCalcItemBonusId) {
    const bonusGroups: ExclusiveAttackBonusGroup[] = [];
    const bonuses = (id && this.attkRecord.get(id)) || [];

    for (const bonus of bonuses) {
      const newBonus: ExclusiveAttackBonus = {
        value: bonus.value,
        label: bonus.label,
      };

      const newBonusCount = bonusGroups
        .find((group) => group.type === bonus.toKey)
        ?.items.push(newBonus);

      // No existing group, add a new one
      if (newBonusCount === undefined) {
        bonusGroups.push({
          type: bonus.toKey,
          items: [newBonus],
        });
      }
    }

    return bonusGroups;
  }

  reset() {
    this.tllvRecord.clear();
    this.attrRecord.clear();
    this.attkRecord.clear();
  }
}
