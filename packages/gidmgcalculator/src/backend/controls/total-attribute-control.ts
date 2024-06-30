import type { PartiallyRequired } from "rond";
import type { Artifact, Character, Weapon } from "@Src/types";
import type { AppCharacter, AppWeapon, AttributeStat, CoreStat } from "@Src/backend/types";

import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES, LEVELS } from "@Src/backend/constants";
import { applyPercent, toArray } from "@Src/utils";
import { GeneralCalc, ArtifactCalc, WeaponCalc } from "@Src/backend/utils";

/** Actually does not contain "hp_" | "atk_" | "def_" */
type TotalAttributeStat = AttributeStat | "hp_base" | "atk_base" | "def_base";

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<TotalAttributeStat, number>;

export type ArtifactAttribute = PartiallyRequired<Partial<Record<AttributeStat, number>>, CoreStat>;

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

export type GetTotalAttributeType = "ALL" | "STABLE";

type RecordBonus = (stat: AttributeStat, value: number, description: string) => void;

export class TotalAttributeControl {
  protected totalAttr: InternalTotalAttribute;
  private record?: RecordBonus;

  constructor(totalAttr?: InternalTotalAttribute, record?: RecordBonus) {
    if (totalAttr) {
      this.totalAttr = totalAttr;
    } else {
      this.totalAttr = {} as InternalTotalAttribute;

      for (const type of ATTRIBUTE_STAT_TYPES) {
        this.totalAttr[type] = {
          base: 0,
          stableBonus: 0,
          unstableBonus: 0,
        };
      }
    }
    this.record = record;
  }

  static getArtifactAttribute(artifacts: Array<Artifact | null>, getBase: (stat: "hp" | "atk" | "def") => number) {
    const artAttr: ArtifactAttribute = {
      hp: 0,
      atk: 0,
      def: 0,
    };

    for (const artifact of artifacts) {
      if (!artifact) continue;

      const { mainStatType, subStats } = artifact;
      const mainStat = ArtifactCalc.mainStatValueOf(artifact);

      artAttr[mainStatType] = (artAttr[mainStatType] || 0) + mainStat;

      for (const subStat of subStats) {
        artAttr[subStat.type] = (artAttr[subStat.type] || 0) + subStat.value;
      }
    }

    for (const statType of CORE_STAT_TYPES) {
      const percentStatValue = artAttr[`${statType}_`];

      if (percentStatValue) {
        artAttr[statType] += applyPercent(getBase(statType), percentStatValue);
      }
      delete artAttr[`${statType}_`];
    }

    return artAttr;
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

    const attribute = this._getArtifactAttribute(artifacts);

    for (const key in attribute) {
      const type = key as keyof typeof attribute;
      const value = attribute[type];
      if (value) this.addStable(type, value, "Artifact stat");
    }

    return attribute;
  };

  clone = () => {
    return new TotalAttributeControl(structuredClone(this.totalAttr));
  };

  private addBase = (key: AttributeStat, value: number, description = "Character base stat") => {
    this.totalAttr[key].base += value;
    this.record?.(key, value, description);
  };

  addStable = (keys: AttributeStat | AttributeStat[], value: number, description: string) => {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].stableBonus += value;
      this.record?.(key, value, description);
    });
  };

  addUnstable = (keys: AttributeStat | AttributeStat[], value: number, description: string) => {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].unstableBonus += value;
      this.record?.(key, value, description);
    });
  };

  private _getArtifactAttribute = (artifacts: Array<Artifact | null>) => {
    return TotalAttributeControl.getArtifactAttribute(artifacts, this.getBase);
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
