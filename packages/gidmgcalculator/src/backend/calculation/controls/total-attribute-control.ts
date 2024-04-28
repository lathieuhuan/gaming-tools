import type { CalcCharacter } from "@Src/types";
import type { AttributeStat, AppCharacter, TotalAttribute } from "@Backend/types";
import type { TrackerControl } from "./tracker-control";

import { LEVELS } from "@Src/constants";
import { ATTRIBUTE_STAT_TYPES } from "@Src/backend/constants";

import { toArray } from "@Src/utils";
import { GeneralCalc } from "../utils";

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

export class TotalAttributeControl {
  private totalAttr: InternalTotalAttribute;
  private tracker?: TrackerControl;

  constructor(tracker?: TrackerControl) {
    this.tracker = tracker;
    this.totalAttr = {} as InternalTotalAttribute;

    for (const type of ATTRIBUTE_STAT_TYPES) {
      this.totalAttr[type] = {
        base: 0,
        stableBonus: 0,
        unstableBonus: 0,
      };
    }
  }

  private addBase(key: AttributeStat, value: number, description = "Character base stat") {
    this.totalAttr[key].base += value;
    this.tracker?.recordStat("totalAttr", key, value, description);
  }

  create(char: CalcCharacter, appChar: AppCharacter, weaponAtk: number) {
    // Character inner stats
    const [baseHp, baseAtk, baseDef] = appChar.stats[LEVELS.indexOf(char.level)];
    const scaleIndex = Math.max(GeneralCalc.getAscension(char.level) - 1, 0);
    const bonusScale = [0, 1, 2, 2, 3, 4][scaleIndex];
    let cRate_ = 5;

    // Kokomi
    if (appChar.code === 42) {
      cRate_ = -95;
      this.addBase("healB_", 25);
    }

    this.addBase("hp", baseHp);
    this.addBase("atk", baseAtk);
    this.addBase("atk", weaponAtk, "Weapon main stat");
    this.addBase("def", baseDef);
    this.addBase(appChar.statBonus.type, appChar.statBonus.value * bonusScale);
    this.addBase("cRate_", cRate_);
    this.addBase("cDmg_", 50);
    this.addBase("er_", 100);
    this.addBase("naAtkSpd_", 100);
    this.addBase("caAtkSpd_", 100);

    return this;
  }

  // transform(totalAttr: TotalAttribute) {
  //   this.totalAttr = totalAttr;
  //   return this;
  // }

  addStable(keys: AttributeStat | AttributeStat[], value: number, description: string) {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].stableBonus += value;
      this.tracker?.recordStat("totalAttr", key, value, description);
    });
  }

  addUnstable(keys: AttributeStat | AttributeStat[], value: number, description: string) {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].unstableBonus += value;
      this.tracker?.recordStat("totalAttr", key, value, description);
    });
  }

  getBase(key: AttributeStat) {
    return this.totalAttr[key].base;
  }

  getTotalStable(key: AttributeStat | "base_atk") {
    if (key === "base_atk") {
      return this.getBase("atk");
    }

    const base = this.getBase(key);
    let total = base + this.totalAttr[key].stableBonus;

    if (key === "hp" || key === "atk" || key === "def") {
      const percent = this.totalAttr[`${key}_`];
      const totalPercent = percent.base + percent.stableBonus;
      total += (base * totalPercent) / 100;
    }
    return total;
  }

  getTotal(key: AttributeStat) {
    return this.getTotalStable(key) + this.totalAttr[key].unstableBonus;
  }

  finalize() {
    const totalAttr = {} as TotalAttribute;

    for (const key of ATTRIBUTE_STAT_TYPES) {
      if (key === "hp_" || key === "atk_" || key === "def_") continue;

      totalAttr[key] = {
        total: this.getTotal(key),
      };

      if (key === "hp" || key === "atk" || key === "def") {
        totalAttr[key].bonus = totalAttr[key].total - this.getBase(key);
      }
    }
    return totalAttr;
  }
}
