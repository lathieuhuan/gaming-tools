import {
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  ATTACK_PATTERN_INFO_KEYS,
  ATTRIBUTE_STAT_TYPES,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
} from "@Src/constants";
import type {
  AttackElementPath,
  AttackPatternPath,
  AttributeStat,
  CalcItemBonus,
  CalcItemType,
  ReactionBonusPath,
  ResistanceReductionKey,
} from "@Src/types";

type StatRecord = {
  desc: string;
  value: number;
};

type CalcItemRecord = {
  itemType: CalcItemType;
  multFactors: Array<{
    desc: string;
    value: number;
    talentMult?: number;
  }>;
  totalFlat?: number;
  normalMult: number;
  specialMult?: number;
  rxnMult?: number;
  defMult?: number;
  resMult?: number;
  cRate_?: number;
  cDmg_?: number;
  note?: string;
  exclusives?: CalcItemBonus[];
};

type StatRecordCategory = "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus" | "resistReduct";

type StatRecordType =
  | AttributeStat
  | AttackPatternPath
  | AttackElementPath
  | ReactionBonusPath
  | ResistanceReductionKey;

export class TrackerCalc {
  private stats: Record<string, Record<string, StatRecord[]>>;
  private calcItems: Record<string, Record<string, CalcItemRecord>>;

  constructor() {
    this.stats = {
      totalAttr: {},
      attPattBonus: {},
      attElmtBonus: {},
      rxnBonus: {},
      resistReduct: {},
    };

    this.calcItems = {
      NAs: {},
      ES: {},
      EB: {},
      RXN: {},
      WP_CALC: {},
    };

    for (const stat of ATTRIBUTE_STAT_TYPES) {
      this.stats.totalAttr[stat] = [];
    }
    for (const attPatt of [...ATTACK_PATTERNS, "all"] as const) {
      for (const key of ATTACK_PATTERN_INFO_KEYS) {
        this.stats.attPattBonus[`${attPatt}.${key}`] = [];
      }
    }
    for (const attElmt of ATTACK_ELEMENTS) {
      for (const key of ATTACK_ELEMENT_INFO_KEYS) {
        this.stats.attElmtBonus[`${attElmt}.${key}`] = [];
      }
      this.stats.resistReduct[attElmt] = [];
    }
    this.stats.resistReduct.def = [];

    for (const reaction of REACTIONS) {
      for (const key of REACTION_BONUS_INFO_KEYS) {
        this.stats.rxnBonus[`${reaction}.${key}`] = [];
      }
    }
  }

  recordStat(category: "totalAttr", type: AttributeStat, description: string, value: number): void;
  recordStat(category: "attPattBonus", type: AttackPatternPath, description: string, value: number): void;
  recordStat(category: "attElmtBonus", type: AttackElementPath, description: string, value: number): void;
  recordStat(category: "rxnBonus", type: ReactionBonusPath, description: string, value: number): void;
  recordStat(category: "resistReduct", type: ResistanceReductionKey, description: string, value: number): void;
  recordStat(category: StatRecordCategory, type: StatRecordType, description: string, value: number) {
    const cateRecord = this.stats[category];
    const existed = cateRecord[type].find((record) => record.desc === description);

    if (existed) {
      existed.value += value;
      return;
    }
    cateRecord[type].push({ desc: description, value });
  }
}
