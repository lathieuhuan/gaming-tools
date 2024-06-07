import {
  ATTRIBUTE_STAT_TYPES,
  AppCharacter,
  AppWeapon,
  AttributeStat,
  GeneralCalc,
  LEVELS,
  WeaponCalc,
} from "@Backend";
import type { Artifact, Character, SimulationAttributeBonus, Weapon } from "@Src/types";
import { toArray } from "@Src/utils";
import { _getArtifactAttribute } from "./total-attribute-control.utils";

type SimulationTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

export class TotalAttributeControl {
  private totalAttr: SimulationTotalAttribute;

  constructor(totalAttr?: SimulationTotalAttribute) {
    if (totalAttr) {
      this.totalAttr = totalAttr;
    } else {
      this.totalAttr = {} as SimulationTotalAttribute;

      for (const type of ATTRIBUTE_STAT_TYPES) {
        this.totalAttr[type] = {
          base: 0,
          stableBonus: 0,
          unstableBonus: 0,
        };
      }
    }
  }

  construct = (
    char: Character,
    appChar: AppCharacter,
    weapon: Weapon,
    appWeapon: AppWeapon,
    artifacts: Array<Artifact | null>
  ) => {
    // ========== CHARACTER ==========

    const [baseHp, baseAtk, baseDef] = appChar.stats[LEVELS.indexOf(char.level)];
    const scaleIndex = Math.max(GeneralCalc.getAscension(char.level) - 1, 0);
    const bonusScale = [0, 1, 2, 2, 3, 4][scaleIndex];

    this.addBase("hp", baseHp);
    this.addBase("atk", baseAtk);
    this.addBase("def", baseDef);
    this.addBase("cRate_", 5);
    this.addBase("cDmg_", 50);
    this.addBase("er_", 100);
    this.addBase("naAtkSpd_", 100);
    this.addBase("caAtkSpd_", 100);
    this.addBase(appChar.statBonus.type, appChar.statBonus.value * bonusScale, "Character ascension stat");

    // Kokomi
    if (appChar.code === 42) {
      this.addBase("cRate_", -100, "Character inner stat");
      this.addBase("healB_", 25, "Character inner stat");
    }

    // ========== WEAPON ==========

    this.addBase("atk", WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale), "Weapon main stat");

    if (appWeapon.subStat) {
      const substatValue = WeaponCalc.getSubStatValue(weapon.level, appWeapon.subStat.scale);
      this.addStable(appWeapon.subStat.type, substatValue, `${appWeapon.name} sub-stat`);
    }

    // ========== ARTIFACTS ==========

    const attribute = this.getArtifactAttribute(artifacts);

    for (const key in attribute) {
      const type = key as keyof typeof attribute;
      const value = attribute[type];
      if (value) this.addStable(type, value, "Artifact stat");
    }

    return this;
  };

  private addBase = (key: AttributeStat, value: number, description = "Character base stat") => {
    this.totalAttr[key].base += value;
  };

  private addStable = (keys: AttributeStat | AttributeStat[], value: number, description: string) => {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].stableBonus += value;
    });
  };

  private addUnstable = (keys: AttributeStat | AttributeStat[], value: number, description: string) => {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].unstableBonus += value;
    });
  };

  getArtifactAttribute = (artifacts: Array<Artifact | null>) => {
    return _getArtifactAttribute(artifacts, this.totalAttr);
  };

  getBase = (key: AttributeStat) => {
    return this.totalAttr[key].base;
  };

  getTotal = (key: AttributeStat | "base_atk", type: "ALL" | "STABLE" = "ALL") => {
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
  };

  applyAttributeBonus = (bonuses?: SimulationAttributeBonus[]) => {
    const clonedCtrl = new TotalAttributeControl(structuredClone(this.totalAttr));

    if (bonuses) {
      for (const bonus of bonuses) {
        const description = `${bonus.trigger.character} / ${bonus.trigger.src}`;
        const add = bonus.stable ? clonedCtrl.addStable : clonedCtrl.addUnstable;

        for (const key of toArray(bonus.toStat)) {
          add(key, bonus.value, description);
        }
      }
    }

    return clonedCtrl;
  };
}
