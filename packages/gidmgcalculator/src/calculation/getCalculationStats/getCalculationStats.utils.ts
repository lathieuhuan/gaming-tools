import type {
  AppCharacter,
  AppWeapon,
  ArtifactAttribute,
  AttackElementBonus,
  AttacklementInfo,
  AttackPatternBonus,
  AttackPatternInfo,
  CalcArtifacts,
  CalcItemBuff,
  CalcWeapon,
  Character,
  CoreStat,
  ReactionBonus,
  ReactionBonusInfo,
  TotalAttribute,
  Tracker,
  TrackerRecord,
} from "@Src/types";
import {
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  ATTACK_PATTERN_INFO_KEYS,
  ATTRIBUTE_STAT_TYPES,
  BASE_STAT_TYPES,
  CORE_STAT_TYPES,
  LEVELS,
  REACTIONS,
  REACTION_BONUS_INFO_KEYS,
} from "@Src/constants";
import { applyPercent, CalculationUtils, WeaponUtils, ArtifactUtils } from "@Src/utils";

function addOrInit<T extends Partial<Record<K, number | undefined>>, K extends keyof T>(obj: T, key: K, value: number) {
  obj[key] = (((obj[key] as number | undefined) || 0) + value) as T[K];
}

export const addTrackerRecord = (list: TrackerRecord[] | undefined, desc: string, value: number) => {
  if (!list) return;

  const existed = list.find((note: any) => note.desc === desc);
  if (existed) {
    existed.value += value;
  } else {
    list.push({ desc, value });
  }
};

interface InitiateTotalAttrArgs {
  char: Character;
  appChar: AppCharacter;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  tracker?: Tracker;
}
export const initiateTotalAttr = ({ char, appChar, weapon, appWeapon, tracker }: InitiateTotalAttrArgs) => {
  const totalAttr = {} as TotalAttribute;

  for (const type of [...BASE_STAT_TYPES, ...ATTRIBUTE_STAT_TYPES]) {
    totalAttr[type] = 0;
  }

  // Character inner stats
  const [base_hp, base_atk, base_def] = appChar.stats[LEVELS.indexOf(char.level)];

  const innerStats = {
    base_hp,
    base_atk,
    base_def,
  } as TotalAttribute;

  const scaleIndex = Math.max(CalculationUtils.getAscsFromLv(char.level) - 1, 0);
  const bonusScale = [0, 1, 2, 2, 3, 4][scaleIndex];

  addOrInit(innerStats, appChar.statBonus.type, appChar.statBonus.value * bonusScale);
  addOrInit(innerStats, "cRate_", 5);
  addOrInit(innerStats, "cDmg_", 50);
  addOrInit(innerStats, "er_", 100);
  addOrInit(innerStats, "naAtkSpd_", 100);
  addOrInit(innerStats, "caAtkSpd_", 100);

  // Kokomi
  if (appChar.code === 42) {
    innerStats.cRate_ -= 100;
    innerStats.healB_ = 25;
  }
  const baseConvertMap: Record<string, CoreStat> = {
    base_atk: "atk",
    base_hp: "hp",
    base_def: "def",
  };

  for (const type in innerStats) {
    const key = type as keyof typeof innerStats;
    totalAttr[key] += innerStats[key];

    const trackerField = baseConvertMap[key] || key;
    addTrackerRecord(tracker?.totalAttr[trackerField], "Character base stat", innerStats[key]);
  }

  // Weapon main stat
  const weaponAtk = WeaponUtils.getMainStatValue(weapon.level, appWeapon.mainStatScale);
  totalAttr.base_atk += weaponAtk;
  addTrackerRecord(tracker?.totalAttr.atk, "Weapon main stat", weaponAtk);

  return totalAttr;
};

export const initiateBonuses = () => {
  const attPattBonus = {} as AttackPatternBonus;
  for (const pattern of [...ATTACK_PATTERNS, "all"] as const) {
    attPattBonus[pattern] = {} as AttackPatternInfo;

    for (const key of ATTACK_PATTERN_INFO_KEYS) {
      attPattBonus[pattern][key] = 0;
    }
  }

  const attElmtBonus = {} as AttackElementBonus;
  for (const element of ATTACK_ELEMENTS) {
    attElmtBonus[element] = {} as AttacklementInfo;

    for (const key of ATTACK_ELEMENT_INFO_KEYS) {
      attElmtBonus[element][key] = 0;
    }
  }

  const rxnBonus = {} as ReactionBonus;
  for (const rxn of REACTIONS) {
    rxnBonus[rxn] = {} as ReactionBonusInfo;

    for (const key of REACTION_BONUS_INFO_KEYS) {
      rxnBonus[rxn][key] = 0;
    }
  }

  const calcItemBuffs: CalcItemBuff[] = [];

  return {
    attPattBonus,
    attElmtBonus,
    rxnBonus,
    calcItemBuffs,
  };
};

export const addArtifactAttributes = (
  artifacts: CalcArtifacts,
  totalAttr: TotalAttribute,
  tracker?: Tracker
): ArtifactAttribute => {
  const artAttr = { hp: 0, atk: 0, def: 0 } as ArtifactAttribute;

  for (const artifact of artifacts) {
    if (!artifact) continue;

    const { type, mainStatType, subStats } = artifact;
    const mainStat = ArtifactUtils.getMainStatValue(artifact);

    addOrInit(artAttr, mainStatType, mainStat);
    addTrackerRecord(tracker?.totalAttr[mainStatType], type, mainStat);

    for (const subStat of subStats) {
      addOrInit(artAttr, subStat.type, subStat.value);
      addTrackerRecord(tracker?.totalAttr[subStat.type], "Artifact sub-stat", subStat.value);
    }
  }
  for (const statType of CORE_STAT_TYPES) {
    const percentStatValue = artAttr[`${statType}_`];
    if (percentStatValue) {
      artAttr[statType] += applyPercent(totalAttr[`base_${statType}`], percentStatValue);
    }
    delete artAttr[`${statType}_`];
  }
  for (const type in artAttr) {
    const key = type as keyof typeof artAttr;
    totalAttr[key] += artAttr[key] || 0;
  }
  return artAttr;
};

type Stack = {
  type: string;
  field?: string;
};
export const isFinalBonus = (bonusStacks?: Stack | Stack[]) => {
  if (bonusStacks) {
    const isFinal = (stack: Stack) => stack.type === "attribute" && stack.field !== "base_atk";
    return Array.isArray(bonusStacks) ? bonusStacks.some(isFinal) : isFinal(bonusStacks);
  }
  return false;
};
