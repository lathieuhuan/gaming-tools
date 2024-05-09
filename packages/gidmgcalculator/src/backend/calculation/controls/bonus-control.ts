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
  ElementType,
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
  ELEMENT_TYPES,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
} from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal.constants";
import { toArray } from "@Src/utils";

type CalcBonusModule = ECalcStatModule.PATT | ECalcStatModule.ELMT | ECalcStatModule.PAEL | ECalcStatModule.RXN;

type AttackPatternElementBonus = Record<`NA.${ElementType}`, number>;

export class BonusControl {
  private tracker?: TrackerControl;
  private attPattBonus: AttackPatternBonus;
  private attElmtBonus: AttackElementBonus;
  private attPattElmtBonus: AttackPatternElementBonus;
  private rxnBonus: ReactionBonus;

  constructor(tracker?: TrackerControl) {
    this.tracker = tracker;
    this.attPattBonus = {} as AttackPatternBonus;
    this.attElmtBonus = {} as AttackElementBonus;
    this.attPattElmtBonus = {} as AttackPatternElementBonus;
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

    for (const element of ELEMENT_TYPES) {
      this.attPattElmtBonus[`NA.${element}`] = 0;
    }

    for (const rxn of REACTIONS) {
      this.rxnBonus[rxn] = {} as ReactionBonusInfo;

      for (const key of REACTION_BONUS_INFO_KEYS) {
        this.rxnBonus[rxn][key] = 0;
      }
    }
  }

  add(module: CalcBonusModule, paths: string | string[], value: number, description: string) {
    toArray(paths).forEach((path) => {
      const [key1, key2] = path.split(".");

      switch (module) {
        case ECalcStatModule.PATT:
          this.attPattBonus[key1 as AttackPatternBonusKey][key2 as AttackPatternInfoKey] += value;
          this.tracker?.recordStat(module, path as AttackPatternPath, value, description);
          break;
        case ECalcStatModule.ELMT:
          this.attElmtBonus[key1 as AttackElement][key2 as AttackElementInfoKey] += value;
          this.tracker?.recordStat(module, path as AttackElementPath, value, description);
          break;
        case ECalcStatModule.PAEL:
          this.attPattElmtBonus[`NA.${key1 as ElementType}`] += value;
          break;
        case ECalcStatModule.RXN:
          this.rxnBonus[key1 as ReactionType][key2 as ReactionBonusInfoKey] += value;
          this.tracker?.recordStat(module, path as ReactionBonusPath, value, description);
          break;
      }
    });
  }

  serialize(module: ECalcStatModule.PATT): AttackPatternBonus;
  serialize(module: ECalcStatModule.ELMT): AttackElementBonus;
  serialize(module: ECalcStatModule.PAEL): AttackPatternElementBonus;
  serialize(module: ECalcStatModule.RXN): ReactionBonus;
  serialize(
    module: CalcBonusModule
  ): AttackPatternBonus | AttackElementBonus | AttackPatternElementBonus | ReactionBonus {
    switch (module) {
      case ECalcStatModule.PATT: {
        const result = {} as AttackPatternBonus;

        for (const pattern of [...ATTACK_PATTERNS, "all"] as const) {
          result[pattern] = {
            ...this.attPattBonus[pattern],
          };
        }
        return result;
      }
      case ECalcStatModule.ELMT: {
        const result = {} as AttackElementBonus;

        for (const element of ATTACK_ELEMENTS) {
          result[element] = {
            ...this.attElmtBonus[element],
          };
        }
        return result;
      }
      case ECalcStatModule.PAEL: {
        return this.attPattElmtBonus;
      }
      case ECalcStatModule.RXN: {
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
