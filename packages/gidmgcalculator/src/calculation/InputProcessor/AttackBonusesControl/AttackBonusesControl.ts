import type { PartiallyOptional } from "rond";
import type {
  AppliedAttackBonus,
  AttackBonuses,
  AttackBonusKey,
  AttackBonusType,
  TalentCalcItem,
  Level,
} from "@/calculation/types";
import type { CalcAtomicRecord, CalcItemExclusiveBonus } from "@/calculation/utils/TrackerControl";

import Array_ from "@/utils/array-utils";
import Object_ from "@/utils/object-utils";
import TypeCounter from "@/utils/type-counter";
import { GeneralCalc } from "@/calculation/utils/calc-utils";

/** should not use 'all' in AttackBonusType */
type GetBonusPaths = Array<AttackBonusType | undefined>;

type BonusToAdd = PartiallyOptional<AppliedAttackBonus, "id">;

export class AttackBonusesControl {
  private attkBonuses: AttackBonuses = [];

  add = (bonuses: BonusToAdd | BonusToAdd[]) => {
    for (const bonus of Array_.toArray(bonuses)) {
      if (bonus.value) {
        const record = Object_.pickProps(bonus, ["value", "toKey", "description"]);
        const existedBonus = this.attkBonuses.find((existBonus) => existBonus.type === bonus.toType);

        if (existedBonus) {
          existedBonus.records.push(record);
        } else {
          this.attkBonuses.push({
            type: bonus.toType,
            records: [record],
          });
        }
      }
    }
  };

  /**
   * Get all bonuses whose type is included in paths.
   * Ex: paths = ['ES', 'pyro'] => get ES and pyro bonuses, not ES.pyro
   */
  static get = (attkBonuses: AttackBonuses, key: AttackBonusKey, ...paths: GetBonusPaths) => {
    let result = 0;

    for (const bonus of attkBonuses) {
      if (paths.some((path) => path && bonus.type === path)) {
        for (const record of bonus.records) {
          if (record.toKey === key) {
            result += record.value;
          }
        }
      }
    }
    return result;
  };

  /** Calculate & add Dendro flat bonus from characterLevel & all spread pct_ bonus */
  applySpreadBuff = (characterLevel: Level) => {
    this.add({
      value: GeneralCalc.getQuickenBuffDamage(
        "spread",
        characterLevel,
        AttackBonusesControl.get(this.attkBonuses, "pct_", "spread")
      ),
      toType: "dendro",
      toKey: "flat",
      description: "Spread reaction",
    });
  };

  /** Calculate & add Electro flat bonus from characterLevel & all aggravate pct_ bonus */
  applyAggravateBuff = (characterLevel: Level) => {
    this.add({
      value: GeneralCalc.getQuickenBuffDamage(
        "aggravate",
        characterLevel,
        AttackBonusesControl.get(this.attkBonuses, "pct_", "aggravate")
      ),
      toType: "electro",
      toKey: "flat",
      description: "Aggravate reaction",
    });
  };

  /**
   * Should not add bonuses after genArchive, the current logic is add no get -> get & no add
   * */
  genArchive = () => {
    return new AttackBonusesArchive(Object_.clone(this.attkBonuses));
  };
}

/** AttackBonuses */
export class AttackBonusesArchive {
  private allBonuses = new TypeCounter<AttackBonusKey>();

  constructor(private attkBonuses: AttackBonuses) {
    for (const bonus of attkBonuses) {
      if (bonus.type === "all") {
        for (const record of bonus.records) {
          this.allBonuses.add(record.toKey, record.value);
        }
      }
    }
  }

  /**
   * Get all bonuses whose type is included in paths.
   * Ex: paths = ['ES', 'pyro'] => get ES and pyro bonuses, not ES.pyro
   */
  get = (key: AttackBonusKey, ...paths: GetBonusPaths) => {
    return this.allBonuses.get(key) + this.getBare(key, ...paths);
  };

  getBare = (key: AttackBonusKey, ...paths: GetBonusPaths) => {
    return AttackBonusesControl.get(this.attkBonuses, key, ...paths);
  };

  getExclusiveBonuses = (entity: TalentCalcItem["id"] | Pick<TalentCalcItem, "id">): CalcItemExclusiveBonus[] => {
    const filterRecords: CalcItemExclusiveBonus[] = [];
    const id = typeof entity === "string" ? entity : entity?.id;
    const bonusRecords = id ? this.attkBonuses.find((bonus) => bonus.type === id)?.records || [] : [];

    for (const record of bonusRecords) {
      const existed = filterRecords.find((filterRecord) => filterRecord.type === record.toKey);
      const newRecord: CalcAtomicRecord = {
        value: record.value,
        description: record.description,
      };

      if (existed) {
        existed.records.push(newRecord);
      } else {
        filterRecords.push({
          type: record.toKey,
          records: [newRecord],
        });
      }
    }
    return filterRecords;
  };

  serialize = () => this.attkBonuses;
}
