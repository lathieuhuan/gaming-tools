import type {
  ActualAttackPattern,
  AttackBonusType,
  AttackElement,
  BonusKey,
  ReactionBonus,
  ReactionBonusInfo,
  ReactionBonusInfoKey,
  ReactionBonusPath,
  ReactionType,
} from "@Src/backend/types";
import type { TrackerControl } from "./tracker-control";

import { REACTIONS, REACTION_BONUS_INFO_KEYS } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal.constants";
import { toArray } from "@Src/utils";

type AttackBonusRecord = {
  desc: string;
  value: number;
  to: BonusKey;
};

export type AttackBonus = Array<{
  type: AttackBonusType;
  records: AttackBonusRecord[];
}>;

export class BonusControl {
  private tracker?: TrackerControl;
  private attBonus: AttackBonus = [];
  private rxnBonus: ReactionBonus;

  private finalizedAttackBonusAll = false;
  private attackBonusAll: Partial<Record<BonusKey, number>> = {};

  constructor(tracker?: TrackerControl) {
    this.tracker = tracker;
    this.rxnBonus = {} as ReactionBonus;

    for (const rxn of REACTIONS) {
      this.rxnBonus[rxn] = {} as ReactionBonusInfo;
    }
  }

  addAttackBonus(module: AttackBonusType, path: BonusKey, value: number, description: string) {
    const existedBonus = this.attBonus.find((bonus) => bonus.type === module);
    const record: AttackBonusRecord = {
      desc: description,
      value,
      to: path,
    };

    if (existedBonus) {
      existedBonus.records.push(record);
    } else {
      this.attBonus.push({
        type: module,
        records: [record],
      });
    }
  }

  private finalizeAttackBonusAll() {
    for (const bonus of this.attBonus) {
      if (bonus.type === "all") {
        for (const record of bonus.records) {
          this.attackBonusAll[record.to] = (this.attackBonusAll[record.to] ?? 0) + record.value;
        }
      }
    }
  }

  getAttackBonus(path: BonusKey, attPatt: ActualAttackPattern, attElmt: AttackElement) {
    if (!this.finalizedAttackBonusAll) {
      this.finalizeAttackBonusAll();
      this.finalizedAttackBonusAll = true;
    }

    let result = this.attackBonusAll[path] ?? 0;

    for (const bonus of this.attBonus) {
      if (bonus.type.includes(attPatt) || bonus.type.includes(attElmt)) {
        for (const record of bonus.records) {
          if (record.to === path) {
            result += record.value;
          }
        }
      }
    }

    return result;
  }

  addRxnBonus(paths: ReactionBonusPath | ReactionBonusPath[], value: number, description: string) {
    toArray(paths).forEach((path) => {
      const [key1, key2] = path.split(".");
      const path1 = key1 as ReactionType;
      const path2 = key2 as ReactionBonusInfoKey;

      this.rxnBonus[path1][path2] = (this.rxnBonus[path1][path2] ?? 0) + value;
      this.tracker?.recordStat(ECalcStatModule.RXN, path, value, description);
    });
  }

  getRxnBonus(path1: ReactionType, path2: ReactionBonusInfoKey) {
    return this.rxnBonus[path1]?.[path2] ?? 0;
  }

  serialize(module: "rxnBonus"): ReactionBonus;
  serialize(module: "attBonus"): AttackBonus;
  serialize(module: "rxnBonus" | "attBonus"): ReactionBonus | AttackBonus {
    switch (module) {
      case "rxnBonus": {
        const result = {} as ReactionBonus;

        for (const rxn of REACTIONS) {
          result[rxn] = {} as ReactionBonusInfo;

          for (const key of REACTION_BONUS_INFO_KEYS) {
            result[rxn][key] = this.getRxnBonus(rxn, key);
          }
        }
        return result;
      }
      case "attBonus":
        return [...this.attBonus];
    }
  }
}
