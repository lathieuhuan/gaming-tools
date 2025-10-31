import type {
  AppCharacter,
  AppliedAttributeBonus,
  ArtifactAttribute,
  AttributeStat,
  Level,
  TotalAttribute,
} from "@/calculation/types";
import { round, type PartiallyOptional } from "rond";

import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES } from "@/calculation/constants";
import { ECalcStatModule } from "@/calculation/constants/internal";
import { TrackerControl } from "@/calculation/TrackerControl";
import { ArtifactCalc, GeneralCalc, WeaponCalc } from "@/calculation/utils";
import { applyPercent } from "@/utils";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { CharacterC, ICharacterArtifacts } from "./Character";
import { WeaponC } from "./Weapon";
import { TrackerC } from "./Tracker";

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

type BonusToApply = {
  toStat: AttributeStat;
  value: number;
  description: string;
  isUnstable?: boolean;
};

export class TotalAttributeControl {
  totalAttr: InternalTotalAttribute;
  tracker?: TrackerC;

  constructor(tracker?: TrackerC) {
    this.totalAttr = this.reset(tracker);
  }

  reset = (tracker?: TrackerC) => {
    this.tracker = tracker;
    this.totalAttr = {} as InternalTotalAttribute;

    for (const type of ATTRIBUTE_STAT_TYPES) {
      this.totalAttr[type] = {
        base: 0,
        stableBonus: 0,
        unstableBonus: 0,
      };
    }

    return this.totalAttr;
  };

  addBase = (key: AttributeStat, value: number, description = "Character base stat") => {
    this.totalAttr[key].base += value;
    this.tracker?.recordATTR(key, value, description);
  };

  applyBonuses = (bonuses: BonusToApply | BonusToApply[]) => {
    for (const bonus of Array_.toArray(bonuses)) {
      const statType = bonus.toStat.slice(5);

      if (isCoreStat(statType)) {
        this.addBase(statType, bonus.value, bonus.description);
        continue;
      }

      if (bonus.isUnstable) {
        this.totalAttr[bonus.toStat].unstableBonus += bonus.value;
      } else {
        this.totalAttr[bonus.toStat].stableBonus += bonus.value;
      }

      this.tracker?.recordATTR(bonus.toStat, bonus.value, bonus.description);
    }
  };

  getBase = (key: AttributeStat) => {
    return this.totalAttr[key].base;
  };

  getTotal = (key: AttributeStat | "base_atk") => {
    if (key === "base_atk") {
      return this.getBase("atk");
    }

    const base = this.getBase(key);
    let total = base + this.totalAttr[key].stableBonus + this.totalAttr[key].unstableBonus;

    if (isCoreStat(key)) {
      const percent = this.totalAttr[`${key}_`];
      const totalPercent = percent.base + percent.stableBonus + percent.unstableBonus;
      total += (base * totalPercent) / 100;
    }
    return total;
  };

  getTotalStable = (key: AttributeStat | "base_atk") => {
    if (key === "base_atk") {
      return this.getBase("atk");
    }

    const base = this.getBase(key);
    let total = base + this.totalAttr[key].stableBonus;

    if (isCoreStat(key)) {
      const percent = this.totalAttr[`${key}_`];
      const totalPercent = percent.base + percent.stableBonus;
      total += (base * totalPercent) / 100;
    }
    return total;
  };

  finalize(): TotalAttribute {
    const totalAttr = {} as TotalAttribute;

    for (const key of ATTRIBUTE_STAT_TYPES) {
      if (key === "hp_" || key === "atk_" || key === "def_") {
        continue;
      }
      if (isCoreStat(key)) {
        totalAttr[`${key}_base`] = this.getBase(key);
      }
      totalAttr[key] = this.getTotal(key);
    }
    return totalAttr;
  }
}

function isCoreStat(key: string) {
  return key === "hp" || key === "atk" || key === "def";
}

class ArtifactAttributeControl {
  artAttr: ArtifactAttribute;

  constructor(artifacts: ICharacterArtifacts) {
    const artAttr: ArtifactAttribute = {
      hp: 0,
      atk: 0,
      def: 0,
    };

    for (const artifact of artifacts) {
      if (!artifact) continue;

      artAttr[artifact.mainStatType] =
        (artAttr[artifact.mainStatType] || 0) + ArtifactCalc.mainStatValueOf(artifact);

      for (const subStat of artifact.subStats) {
        artAttr[subStat.type] = (artAttr[subStat.type] || 0) + subStat.value;
      }
    }

    this.artAttr = artAttr;
  }

  finalize = (baseStats: { hp_base: number; atk_base: number; def_base: number }) => {
    const finalArtAttr = Object_.clone(this.artAttr);

    for (const statType of CORE_STAT_TYPES) {
      const percentStatValue = finalArtAttr[`${statType}_`];

      if (percentStatValue) {
        finalArtAttr[statType] += applyPercent(baseStats[`${statType}_base`], percentStatValue);
      }
      delete finalArtAttr[`${statType}_`];
    }

    return finalArtAttr;
  };
}
