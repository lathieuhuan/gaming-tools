import type { Artifact, Character, Weapon } from "@Src/types";
import {
  ATTRIBUTE_STAT_TYPES,
  AppCharacter,
  AppWeapon,
  ArtifactAttribute,
  ArtifactCalc,
  AttributeStat,
  CORE_STAT_TYPES,
  GeneralCalc,
  LEVELS,
  WeaponCalc,
} from "@Backend";
import { applyPercent, toArray } from "@Src/utils";

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

  constructor(
    char: Character,
    appChar: AppCharacter,
    weapon: Weapon,
    appWeapon: AppWeapon,
    artifacts: Array<Artifact | null>
  ) {
    this.totalAttr = {} as SimulationTotalAttribute;

    for (const type of ATTRIBUTE_STAT_TYPES) {
      this.totalAttr[type] = {
        base: 0,
        stableBonus: 0,
        unstableBonus: 0,
      };
    }

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
  }

  private addBase = (key: AttributeStat, value: number, description = "Character base stat") => {
    this.totalAttr[key].base += value;
  };

  getArtifactAttribute = (artifacts: Array<Artifact | null>) => {
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
        artAttr[statType] += applyPercent(this.totalAttr[statType].base, percentStatValue);
      }
      delete artAttr[`${statType}_`];
    }

    return artAttr;
  };

  addStable = (keys: AttributeStat | AttributeStat[], value: number, description: string) => {
    toArray(keys).forEach((key) => {
      this.totalAttr[key].stableBonus += value;
    });
  };
}
