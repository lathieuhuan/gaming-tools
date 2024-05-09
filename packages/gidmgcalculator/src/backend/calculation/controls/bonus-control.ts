import type {
  ActualAttackPattern,
  AttackElement,
  AttackElementBonus,
  AttackElementInfoKey,
  AttackElementPath,
  AttackPatternBonus,
  AttackPatternBonusKey,
  AttackPatternElementBonus,
  AttackPatternElementBonusKey,
  AttackPatternElementInfo,
  AttackPatternElementInfoKey,
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
  ATTACK_PATTERNS,
  ELEMENT_TYPES,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
} from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal.constants";
import { toArray } from "@Src/utils";

type CalcBonusModule = ECalcStatModule.PATT | ECalcStatModule.ELMT | ECalcStatModule.PAEL | ECalcStatModule.RXN;

export type GetTotalBonusKey = AttackPatternInfoKey | AttackElementInfoKey | AttackPatternElementInfoKey;

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

      // for (const key of ATTACK_PATTERN_INFO_KEYS) {
      //   this.attPattBonus[pattern][key] = 0;
      // }
    }

    for (const element of ATTACK_ELEMENTS) {
      this.attElmtBonus[element] = {} as AttacklementInfo;

      // for (const key of ATTACK_ELEMENT_INFO_KEYS) {
      //   this.attElmtBonus[element][key] = 0;
      // }
    }

    for (const element of ELEMENT_TYPES) {
      this.attPattElmtBonus[`NA.${element}`] = {} as AttackPatternElementInfo;
    }

    for (const rxn of REACTIONS) {
      this.rxnBonus[rxn] = {} as ReactionBonusInfo;

      // for (const key of REACTION_BONUS_INFO_KEYS) {
      //   this.rxnBonus[rxn][key] = 0;
      // }
    }
  }

  add(module: CalcBonusModule, paths: string | string[], value: number, description: string) {
    toArray(paths).forEach((path) => {
      const [key1, key2] = path.split(".");

      switch (module) {
        case ECalcStatModule.PATT: {
          const path1 = key1 as AttackPatternBonusKey;
          const path2 = key2 as AttackPatternInfoKey;

          this.attPattBonus[path1][path2] = (this.attPattBonus[path1][path2] ?? 0) + value;
          this.tracker?.recordStat(module, path as AttackPatternPath, value, description);
          break;
        }
        case ECalcStatModule.ELMT: {
          const path1 = key1 as AttackElement;
          const path2 = key2 as AttackElementInfoKey;

          this.attElmtBonus[path1][path2] = (this.attElmtBonus[path1][path2] ?? 0) + value;
          this.tracker?.recordStat(module, path as AttackElementPath, value, description);
          break;
        }
        case ECalcStatModule.PAEL: {
          const path1 = `NA.${key1 as AttackPatternElementBonusKey}` as const;
          const path2 = key2 as AttackPatternElementInfoKey;

          this.attPattElmtBonus[path1][path2] = (this.attPattElmtBonus[path1][path2] ?? 0) + value;
          break;
        }
        case ECalcStatModule.RXN: {
          const path1 = key1 as ReactionType;
          const path2 = key2 as ReactionBonusInfoKey;

          this.rxnBonus[path1][path2] = (this.rxnBonus[path1][path2] ?? 0) + value;
          this.tracker?.recordStat(module, path as ReactionBonusPath, value, description);
          break;
        }
        default:
          module;
      }
    });
  }

  getRxnBonus(path1: ReactionType, path2: ReactionBonusInfoKey) {
    return this.rxnBonus[path1]?.[path2] ?? 0;
  }

  getTotalBonus(path: GetTotalBonusKey, attPatt: ActualAttackPattern, attElmt: AttackElement) {
    const attPattElmtKey = `${attPatt as "NA"}.${attElmt as AttackPatternElementBonusKey}` as const;

    return (
      (this.attElmtBonus[attElmt]?.[path as AttackElementInfoKey] ?? 0) +
      (this.attPattBonus.all?.[path] ?? 0) +
      (this.attPattBonus[attPatt as AttackPatternBonusKey]?.[path] ?? 0) +
      (this.attPattElmtBonus[attPattElmtKey]?.[path as AttackPatternElementInfoKey] ?? 0)
    );
  }

  // serialize(module: ECalcStatModule.PATT): AttackPatternBonus;
  // serialize(module: ECalcStatModule.ELMT): AttackElementBonus;
  // serialize(module: ECalcStatModule.PAEL): AttackPatternElementBonus;
  // serialize(module: ECalcStatModule.RXN): ReactionBonus;
  // serialize(
  //   module: CalcBonusModule
  // ): AttackPatternBonus | AttackElementBonus | AttackPatternElementBonus | ReactionBonus {
  serialize(module: ECalcStatModule.RXN): ReactionBonus {
    switch (module) {
      // case ECalcStatModule.PATT: {
      //   const result = {} as AttackPatternBonus;

      //   for (const pattern of [...ATTACK_PATTERNS, "all"] as const) {
      //     result[pattern] = {
      //       ...this.attPattBonus[pattern],
      //     };
      //   }
      //   return result;
      // }
      // case ECalcStatModule.ELMT: {
      //   const result = {} as AttackElementBonus;

      //   for (const element of ATTACK_ELEMENTS) {
      //     result[element] = {
      //       ...this.attElmtBonus[element],
      //     };
      //   }
      //   return result;
      // }
      // case ECalcStatModule.PAEL: {
      //   return this.attPattElmtBonus;
      // }
      case ECalcStatModule.RXN: {
        const result = {} as ReactionBonus;

        for (const rxn of REACTIONS) {
          result[rxn] = {} as ReactionBonusInfo;

          for (const key of REACTION_BONUS_INFO_KEYS) {
            result[rxn][key] = this.getRxnBonus(rxn, key);
          }
        }
        return result;
      }
    }
  }
}
