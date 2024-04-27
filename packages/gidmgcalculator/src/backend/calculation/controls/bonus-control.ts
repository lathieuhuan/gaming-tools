import type {
  AttackElement,
  AttackElementBonus,
  AttackElementInfoKey,
  AttackElementPath,
  AttackPatternBonus,
  AttackPatternBonusKey,
  AttackPatternInfo,
  AttackPatternInfoKey,
  AttackPatternPath,
  AttacklementInfo,
  ReactionBonus,
  ReactionBonusInfo,
  ReactionBonusInfoKey,
  ReactionBonusPath,
  ReactionType,
} from "@Src/backend/types";
import type { TrackerControl } from "./tracker-control";

import {
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  ATTACK_PATTERN_INFO_KEYS,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
} from "@Src/backend/constants";
import { toArray } from "@Src/utils";

type BonusModule = "PATT" | "ELMT" | "RXN";

export class BonusControl {
  private attPattBonus: AttackPatternBonus;
  private attElmtBonus: AttackElementBonus;
  private rxnBonus: ReactionBonus;
  private tracker?: TrackerControl;

  constructor(tracker?: TrackerControl) {
    this.tracker = tracker;
    this.attPattBonus = {} as AttackPatternBonus;
    this.attElmtBonus = {} as AttackElementBonus;
    this.rxnBonus = {} as ReactionBonus;

    for (const pattern of [...ATTACK_PATTERNS, "all"] as const) {
      this.attPattBonus[pattern] = {} as AttackPatternInfo;

      for (const key of ATTACK_PATTERN_INFO_KEYS) {
        this.attPattBonus[pattern][key] = 0;
      }
    }

    for (const element of ATTACK_ELEMENTS) {
      this.attElmtBonus[element] = {} as AttacklementInfo;

      for (const key of ATTACK_ELEMENT_INFO_KEYS) {
        this.attElmtBonus[element][key] = 0;
      }
    }

    for (const rxn of REACTIONS) {
      this.rxnBonus[rxn] = {} as ReactionBonusInfo;

      for (const key of REACTION_BONUS_INFO_KEYS) {
        this.rxnBonus[rxn][key] = 0;
      }
    }
  }

  add(module: BonusModule, paths: string | string[], value: number, description: string) {
    toArray(paths).forEach((path) => {
      const [key1, key2] = path.split(".");

      switch (module) {
        case "PATT":
          this.attPattBonus[key1 as AttackPatternBonusKey][key2 as AttackPatternInfoKey] += value;
          this.tracker?.recordStat("attPattBonus", path as AttackPatternPath, value, description);
          break;
        case "ELMT":
          this.attElmtBonus[key1 as AttackElement][key2 as AttackElementInfoKey] += value;
          this.tracker?.recordStat("attElmtBonus", path as AttackElementPath, value, description);
          break;
        case "RXN":
          this.rxnBonus[key1 as ReactionType][key2 as ReactionBonusInfoKey] += value;
          this.tracker?.recordStat("rxnBonus", path as ReactionBonusPath, value, description);
          break;
      }
    });
  }

  serialize(module: "PATT"): AttackPatternBonus;
  serialize(module: "ELMT"): AttackElementBonus;
  serialize(module: "RXN"): ReactionBonus;
  serialize(module: BonusModule): AttackPatternBonus | AttackElementBonus | ReactionBonus {
    switch (module) {
      case "PATT": {
        const result = {} as AttackPatternBonus;

        for (const pattern of [...ATTACK_PATTERNS, "all"] as const) {
          result[pattern] = {
            ...this.attPattBonus[pattern],
          };
        }
        return result;
      }
      case "ELMT": {
        const result = {} as AttackElementBonus;

        for (const element of ATTACK_ELEMENTS) {
          result[element] = {
            ...this.attElmtBonus[element],
          };
        }
        return result;
      }
      case "RXN": {
        const result = {} as ReactionBonus;

        for (const rxn of REACTIONS) {
          result[rxn] = {
            ...this.rxnBonus[rxn],
          };
        }
        return result;
      }
    }
  }
}
