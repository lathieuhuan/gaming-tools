import type { Artifact, Character, Weapon } from "@Src/types";
import type { PartiallyOptional } from "rond";
import type {
  AppCharacter,
  AppliedAttributeBonus,
  AppWeapon,
  ArtifactAttribute,
  AttributeStat,
  Level,
  TotalAttribute,
} from "@Src/backend/types";

import { applyPercent } from "@Src/utils";
import Array_ from "@Src/utils/array-utils";
import Object_ from "@Src/utils/object-utils";
import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES, LEVELS } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { ArtifactCalc, GeneralCalc, WeaponCalc } from "@Src/backend/common-utils";
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
  private artAttrCtrl = new ArtifactAttributeControl([]);
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

  static getArtifactAttributes(artifacts: Array<Artifact | null>) {
    return new ArtifactAttributeControl(artifacts);
  }

  /** If this was not constructed with artifacts or did not equipArtifacts, call this method will return zeroes */
  finalizeArtifactAttribute(baseStat: Pick<TotalAttribute, "hp_base" | "atk_base" | "def_base">) {
    const artAttr = this.artAttrCtrl.finalize(baseStat);

    Object_.forEach(artAttr, (toStat) => {
      if (artAttr[toStat]) {
        this.tracker?.recordStat(ECalcStatModule.ATTR, toStat, artAttr[toStat], "Artifact stat");
      }
    });

    return artAttr;
  }

  private getCharacterStats(appCharacter: AppCharacter, charLv: Level) {
    const baseStats = appCharacter.stats[LEVELS.indexOf(charLv)];
    const scaleIndex = Math.max(GeneralCalc.getAscension(charLv) - 1, 0);

    return {
      hp: baseStats[0] ?? 0,
      atk: baseStats[1] ?? 0,
      def: baseStats[2] ?? 0,
      ascensionStat: appCharacter.statBonus.value * ([0, 1, 2, 2, 3, 4][scaleIndex] ?? 0),
    };
  }

  construct = (
    character: Character,
    appCharacter: AppCharacter,
    weapon?: Weapon,
    appWeapon?: AppWeapon,
    artifacts: Array<Artifact | null> = []
  ) => {
    const stats = this.getCharacterStats(appCharacter, character.level);

    this.addBase("hp", stats.hp);
    this.addBase("atk", stats.atk);
    this.addBase("def", stats.def);
    this.addBase("cRate_", 5);
    this.addBase("cDmg_", 50);
    this.addBase("er_", 100);
    this.addBase("naAtkSpd_", 100);
    this.addBase("caAtkSpd_", 100);
    this.addBase(appCharacter.statBonus.type, stats.ascensionStat, "Character ascension stat");

    // Kokomi
    if (appCharacter.code === 42) {
      this.addBase("cRate_", -100, "Character inner stat");
      this.addBase("healB_", 25, "Character inner stat");
    }

    this.equipWeapon(weapon, appWeapon);
    this.equipArtifacts(artifacts);

    return this;
  };

  clone = () => {
    return new TotalAttributeControl(structuredClone(this.totalAttr));
  };

  /** Should not be called more than once per instance of this */
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

  /** Should not be called more than once per instance of this */
  equipArtifacts = (artifacts: Array<Artifact | null> = []) => {
    const artAttrCtrl = TotalAttributeControl.getArtifactAttributes(artifacts);

    artAttrCtrl.forEachAttribute((toStat, value) => {
      if (value) {
        this.totalAttr[toStat].stableBonus += value;
      }
    });

    this.artAttrCtrl = artAttrCtrl;
  };

  private addBase = (key: AttributeStat, value: number, description = "Character base stat") => {
    this.totalAttr[key].base += value;
    this.tracker?.recordStat(ECalcStatModule.ATTR, key, value, description);
  };

  applyBonuses = (bonuses: BonusToApply | BonusToApply[]) => {
    for (const bonus of Array_.toArray(bonuses)) {
      if (bonus.toStat === "base_atk") {
        this.addBase("atk", bonus.value, bonus.description);
        continue;
      }
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

function isCoreStat(key: AttributeStat) {
  return key === "hp" || key === "atk" || key === "def";
}

class ArtifactAttributeControl {
  private artAttr: ArtifactAttribute;

  constructor(artifacts: Array<Artifact | null>) {
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

    this.artAttr = artAttr;
  }

  forEachAttribute = (callback: (type: keyof ArtifactAttribute, value: number | undefined) => void) => {
    Object_.forEach(this.artAttr, callback);
  };

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
