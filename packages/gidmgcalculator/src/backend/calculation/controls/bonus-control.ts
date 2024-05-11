import type {
  ActualAttackPattern,
  AttackBonusType,
  AttackElement,
  BonusKey,
  ExclusiveBonusType,
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

// Array of AttackBonusType's segments
type GetBonusPaths = Array<ActualAttackPattern | AttackElement | ReactionType | ExclusiveBonusType>;

export class BonusControl {
  private tracker?: TrackerControl;
  private attBonus: AttackBonus = [];

  private finalizedBonusAll = false;
  private attackBonusAll: Partial<Record<BonusKey, number>> = {};

  constructor(tracker?: TrackerControl) {
    this.tracker = tracker;
  }

  add(module: AttackBonusType, path: BonusKey, value: number, description: string) {
    if (value) {
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
  }

  private finalizeBonusAll() {
    for (const bonus of this.attBonus) {
      if (bonus.type === "all") {
        for (const record of bonus.records) {
          this.attackBonusAll[record.to] = (this.attackBonusAll[record.to] ?? 0) + record.value;
        }
      }
    }
  }

  static getBonus(attBonus: AttackBonus, path: BonusKey, ...paths: GetBonusPaths) {
    let result = 0;

    for (const bonus of attBonus) {
      if (paths.some((path) => bonus.type.includes(path))) {
        for (const record of bonus.records) {
          if (record.to === path) {
            result += record.value;
          }
        }
      }
    }
    return result;
  }

  get(key: BonusKey, ...paths: GetBonusPaths) {
    if (!this.finalizedBonusAll) {
      this.finalizeBonusAll();
      this.finalizedBonusAll = true;
    }

    return (this.attackBonusAll[key] ?? 0) + BonusControl.getBonus(this.attBonus, key, ...paths);
  }

  serialize() {
    return [...this.attBonus];
  }

  // serialize(module: "rxnBonus"): ReactionBonus;
  // serialize(module: "attBonus"): AttackBonus;
  // serialize(module: "rxnBonus" | "attBonus"): ReactionBonus | AttackBonus {
  //   switch (module) {
  //     case "rxnBonus": {
  //       const result = {} as ReactionBonus;

  //       for (const rxn of REACTIONS) {
  //         result[rxn] = {} as ReactionBonusInfo;

  //         for (const key of REACTION_BONUS_INFO_KEYS) {
  //           result[rxn][key] = this.getRxnBonus(rxn, key);
  //         }
  //       }
  //       return result;
  //     }
  //     case "attBonus":
  //       return [...this.attBonus];
  //   }
  // }
}
