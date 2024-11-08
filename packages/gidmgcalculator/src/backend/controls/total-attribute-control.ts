import type { Artifact, Character, Weapon } from "@Src/types";
import type { PartiallyOptional } from "rond";
import type {
  AppCharacter,
  AppliedAttributeBonus,
  AppWeapon,
  ArtifactAttribute,
  AttributeStat,
  CoreStat,
  TotalAttribute,
} from "../types";

import { applyPercent, Object_, toArray, Utils_ } from "@Src/utils";
import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES, LEVELS } from "../constants";
import { ECalcStatModule } from "../constants/internal";
import { ArtifactCalc, GeneralCalc, WeaponCalc } from "../common-utils";
import { TrackerControl } from "./tracker-control";

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

/** 'isStable' default to true */
type BonusToApply = PartiallyOptional<AppliedAttributeBonus, "id" | "isStable">;

export class TotalAttributeControl {
  private totalAttr: InternalTotalAttribute;
  private tracker?: TrackerControl;

  constructor();
  constructor(trackerCtrl?: TrackerControl);
  constructor(totalAttr?: InternalTotalAttribute, trackerCtrl?: TrackerControl);
  constructor(firstArg?: InternalTotalAttribute | TrackerControl, trackerCtrl?: TrackerControl) {
    if (!firstArg || firstArg instanceof TrackerControl) {
      this.totalAttr = {} as InternalTotalAttribute;

      for (const type of ATTRIBUTE_STAT_TYPES) {
        this.totalAttr[type] = {
          base: 0,
          stableBonus: 0,
          unstableBonus: 0,
        };
      }
      this.tracker = firstArg;
    } else {
      this.totalAttr = firstArg;
    }
    this.tracker ||= trackerCtrl;
  }

  static getArtifactAttribute(
    artifacts: Array<Artifact | null>,
    coreBaseStat: Pick<TotalAttribute, `${CoreStat}_base`>
  ) {
    const artAttr: ArtifactAttribute = {
      hp: 0,
      atk: 0,
      def: 0,
    };

    for (const artifact of artifacts) {
      if (!artifact) continue;

      artAttr[artifact.mainStatType] = (artAttr[artifact.mainStatType] || 0) + ArtifactCalc.mainStatValueOf(artifact);

      for (const subStat of artifact.subStats) {
        artAttr[subStat.type] = (artAttr[subStat.type] || 0) + subStat.value;
      }
    }

    for (const statType of CORE_STAT_TYPES) {
      const percentStatValue = artAttr[`${statType}_`];

      if (percentStatValue) {
        artAttr[statType] += applyPercent(coreBaseStat[`${statType}_base`], percentStatValue);
      }
      delete artAttr[`${statType}_`];
    }

    return artAttr;
  }

  private getCharacterStats(char: Character, appChar: AppCharacter) {
    const baseStats = appChar.stats[LEVELS.indexOf(char.level)];
    const scaleIndex = Math.max(GeneralCalc.getAscension(char.level) - 1, 0);

    return {
      hp: baseStats[0] ?? 0,
      atk: baseStats[1] ?? 0,
      def: baseStats[2] ?? 0,
      ascensionStat: appChar.statBonus.value * ([0, 1, 2, 2, 3, 4][scaleIndex] ?? 0),
    };
  }

  construct = (
    char: Character,
    appChar: AppCharacter,
    weapon?: Weapon,
    appWeapon?: AppWeapon,
    artifacts: Array<Artifact | null> = []
  ) => {
    const stats = this.getCharacterStats(char, appChar);

    this.addBase("hp", stats.hp);
    this.addBase("atk", stats.atk);
    this.addBase("def", stats.def);
    this.addBase("cRate_", 5);
    this.addBase("cDmg_", 50);
    this.addBase("er_", 100);
    this.addBase("naAtkSpd_", 100);
    this.addBase("caAtkSpd_", 100);
    this.addBase(appChar.statBonus.type, stats.ascensionStat, "Character ascension stat");

    // Kokomi
    if (appChar.code === 42) {
      this.addBase("cRate_", -100, "Character inner stat");
      this.addBase("healB_", 25, "Character inner stat");
    }

    this.equipWeapon(weapon, appWeapon);
    return this.equipArtifacts(artifacts);
  };

  clone = () => {
    return new TotalAttributeControl(structuredClone(this.totalAttr));
  };

  equipWeapon = (weapon?: Weapon, appWeapon?: AppWeapon) => {
    if (weapon && appWeapon) {
      this.addBase("atk", WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale), "Weapon main stat");

      if (appWeapon.subStat) {
        const substatValue = WeaponCalc.getSubStatValue(weapon.level, appWeapon.subStat.scale);

        this.applyBonuses({
          value: substatValue,
          toStat: appWeapon.subStat.type,
          description: `${appWeapon.name} sub-stat`,
        });
      }
    }
  };

  equipArtifacts = (artifacts: Array<Artifact | null> = []) => {
    const attribute = TotalAttributeControl.getArtifactAttribute(artifacts, {
      hp_base: this.totalAttr.hp.base,
      atk_base: this.totalAttr.atk.base,
      def_base: this.totalAttr.def.base,
    });

    Object_.forEach(attribute, (toStat) => {
      if (attribute[toStat]) {
        this.applyBonuses({
          value: attribute[toStat],
          toStat,
          description: "Artifact stat",
        });
      }
    });

    return attribute;
  };

  private addBase = (key: AttributeStat, value: number, description = "Character base stat") => {
    this.totalAttr[key].base += value;
    this.tracker?.recordStat(ECalcStatModule.ATTR, key, value, description);
  };

  applyBonuses = (bonuses: BonusToApply | BonusToApply[]) => {
    for (const bonus of toArray(bonuses)) {
      if (bonus.isStable ?? true) {
        this.totalAttr[bonus.toStat].stableBonus += bonus.value;
      } else {
        this.totalAttr[bonus.toStat].unstableBonus += bonus.value;
      }
      this.tracker?.recordStat(ECalcStatModule.ATTR, bonus.toStat, bonus.value, bonus.description);
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

    if (Utils_.isCoreStat(key)) {
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

    if (Utils_.isCoreStat(key)) {
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
      if (Utils_.isCoreStat(key)) {
        totalAttr[`${key}_base`] = this.getBase(key);
      }
      totalAttr[key] = this.getTotal(key);
    }
    return totalAttr;
  }
}
