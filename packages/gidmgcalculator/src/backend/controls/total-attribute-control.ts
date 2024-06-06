import type { CalcCharacter } from "@Src/types";
import type { AppCharacter, AttributeStat } from "@Src/backend/types";
import type { TrackerControl } from "./tracker-control";

import { ATTRIBUTE_STAT_TYPES, LEVELS } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { toArray } from "@Src/utils";
import { GeneralCalc } from "@Src/backend/utils/general-calc";

/** Actually does not contain "hp_" | "atk_" | "def_" */
type TotalAttributeStat = AttributeStat | "hp_base" | "atk_base" | "def_base";

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<TotalAttributeStat, number>;

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

export type GetTotalAttributeType = "ALL" | "STABLE";

export class TotalAttributeControl {
  private totalAttr: InternalTotalAttribute;
  private tracker?: TrackerControl;

  constructor(char: CalcCharacter, appChar: AppCharacter, weaponAtk: number, tracker?: TrackerControl) {
    this.tracker = tracker;
    this.totalAttr = {} as InternalTotalAttribute;

    for (const type of ATTRIBUTE_STAT_TYPES) {
      this.totalAttr[type] = {
        base: 0,
        stableBonus: 0,
        unstableBonus: 0,
      };
    }

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
  }

  private addBase(key: AttributeStat, value: number, description = "Character base stat") {
    this.totalAttr[key].base += value;
    this.tracker?.recordStat(ECalcStatModule.ATTR, key, value, description);
  }

  addStable(keys: AttributeStat | AttributeStat[], value: number, description: string) {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].stableBonus += value;
      this.tracker?.recordStat(ECalcStatModule.ATTR, key, value, description);
    });
  }

  addUnstable(keys: AttributeStat | AttributeStat[], value: number, description: string) {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].unstableBonus += value;
      this.tracker?.recordStat(ECalcStatModule.ATTR, key, value, description);
    });
  }

  getBase(key: AttributeStat) {
    return this.totalAttr[key].base;
  }

  getTotal(key: AttributeStat | "base_atk", type: GetTotalAttributeType = "ALL") {
    if (key === "base_atk") {
      return this.getBase("atk");
    }

    const base = this.getBase(key);
    let total = base + this.totalAttr[key].stableBonus + (type === "ALL" ? this.totalAttr[key].unstableBonus : 0);

    if (key === "hp" || key === "atk" || key === "def") {
      const percent = this.totalAttr[`${key}_`];
      const totalPercent = percent.base + percent.stableBonus + (type === "ALL" ? percent.unstableBonus : 0);
      total += (base * totalPercent) / 100;
    }
    return total;
  }

  finalize(): TotalAttribute {
    const totalAttr = {} as TotalAttribute;

    for (const key of ATTRIBUTE_STAT_TYPES) {
      if (key === "hp_" || key === "atk_" || key === "def_") {
        continue;
      }
      if (key === "hp" || key === "atk" || key === "def") {
        totalAttr[`${key}_base`] = this.getBase(key);
      }
      totalAttr[key] = this.getTotal(key, "ALL");
    }
    return totalAttr;
  }
}
