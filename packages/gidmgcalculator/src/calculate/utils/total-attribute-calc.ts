import type { AppCharacter, AttributeStat, CalcCharacter } from "@Src/types";
import { ATTRIBUTE_STAT_TYPES, LEVELS } from "@Src/constants";
import { Calculation_, toArray } from "@Src/utils";
import { TrackerCalc } from "./tracker-calc";

type TotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

export class TotalAttributeCalc {
  private totalAttr: TotalAttribute;
  private tracker?: TrackerCalc;

  constructor(tracker?: TrackerCalc) {
    this.tracker = tracker;
    this.totalAttr = {} as TotalAttribute;

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
    this.tracker?.recordStat("totalAttr", key, description, value);
  }

  create(char: CalcCharacter, appChar: AppCharacter, weaponAtk: number) {
    // Character inner stats
    const [baseHp, baseAtk, baseDef] = appChar.stats[LEVELS.indexOf(char.level)];
    const scaleIndex = Math.max(Calculation_.getAscension(char.level) - 1, 0);
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

  transform(totalAttr: TotalAttribute) {
    this.totalAttr = totalAttr;
    return this;
  }

  addStable(keys: AttributeStat | AttributeStat[], value: number, description: string) {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].stableBonus += value;
      this.tracker?.recordStat("totalAttr", key, description, value);
    });
  }

  addUnstable(keys: AttributeStat | AttributeStat[], value: number, description: string) {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].unstableBonus += value;
      this.tracker?.recordStat("totalAttr", key, description, value);
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
    const { base, stableBonus, unstableBonus } = this.totalAttr[key];
    return base + stableBonus + unstableBonus;
  }
}
