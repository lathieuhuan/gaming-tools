import { round, type PartiallyOptional } from "rond";
import type {
  AppCharacter,
  AppliedAttributeBonus,
  AppWeapon,
  ArtifactAttribute,
  AttributeStat,
  Level,
  TotalAttribute,
} from "@/calculation/types";
import type { Artifact, Character, Weapon } from "@/types";

import { ArtifactCalc, GeneralCalc, WeaponCalc } from "@/calculation/utils";
import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES } from "@/calculation/constants";
import { ECalcStatModule } from "@/calculation/constants/internal";
import { TrackerControl } from "@/calculation/TrackerControl";
import { applyPercent } from "@/utils";
import Array_ from "@/utils/array-utils";
import Object_ from "@/utils/object-utils";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

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

  // Lv 80/90: 8.739 * x + y = 351.59
  // Lv 90/90: 7.836 * x + y = 326.88  // 0.903 * x = 24.71
  // 7.836 * 62.94573 + y = 865.98

  private getCharacterStats(appCharacter: AppCharacter, charLv: Level) {
    const bareLv = GeneralCalc.getBareLv(charLv);
    const ascension = GeneralCalc.getAscension(charLv);
    const { hp, atk, def } = appCharacter.statBases;
    const use4starMult = appCharacter.rarity === 4 || appCharacter.name.slice(-8) === "Traveler";

    let levelMult = (100 + 9 * bareLv) / 109;
    levelMult = use4starMult ? levelMult : (levelMult * (1900 + bareLv)) / 1901;
    levelMult = round(levelMult, 3);

    let atkLevelMult = levelMult;

    if (bareLv > 90) {
      if (bareLv === 95) {
        atkLevelMult = use4starMult ? 9.87 : 10.184;
      } else {
        atkLevelMult = use4starMult ? 11.392 : 11.629;
      }
    }

    const ascensionMult = ASC_MULT_BY_ASC[ascension];
    const ascensionStatMult = ascension > 2 ? ascension - 2 : 0;

    return {
      hp: hp.level * levelMult + hp.ascension * ascensionMult,
      atk: atk.level * atkLevelMult + atk.ascension * ascensionMult,
      def: def.level * levelMult + def.ascension * ascensionMult,
      ascensionStat: appCharacter.statBonus.value * ascensionStatMult,
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
      this.addBase("cRate_", -100, "Character innate stat");
      this.addBase("healB_", 25, "Character innate stat");
    }

    // Lauma
    if (appCharacter.code === 108) {
      this.addBase("em", 200, "Character innate stat");
    }

    this.equipWeapon(weapon, appWeapon);
    this.equipArtifacts(artifacts);

    return this;
  };

  clone = () => {
    return new TotalAttributeControl(Object_.clone(this.totalAttr));
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
      if (bonus.toStat === "base_atk" || bonus.toStat === "base_hp" || bonus.toStat === "base_def") {
        const statType = bonus.toStat.slice(5) as AttributeStat;
        this.addBase(statType, bonus.value, bonus.description);
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
