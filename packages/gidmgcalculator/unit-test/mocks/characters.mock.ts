import { AppCharacter } from "../../src/calculation";
import { $AppCharacter } from "../../src/services";

export enum __EMockCharacter {
  /** pyro, sword, mondstadt */
  BASIC = "BASIC",
  TARTAGLIA = "Tartaglia",
  SKIRK = "Skirk",
  /** electro, catalyst, inazuma */
  CATALYST = "CATALYST",
  /** cryo, polearm, sumeru */
  ES_CALC_CONFIG = "ES_CALC_CONFIG",
  /** anemo, claymore, natlan */
  ANEMO = "ANEMO",
  /** pyro, bow, natlan */
  PYRO = "PYRO",
}

const STATS: AppCharacter["statBases"] = {
  atk: { level: 100, ascension: 10 },
  def: { level: 50, ascension: 5 },
  hp: { level: 100, ascension: 10 },
};

const CALC_LIST: AppCharacter["calcList"] = {
  NA: [
    { name: "Hit 1", factor: 10 },
    { name: "Hit 2", factor: 12 },
  ],
  CA: [{ name: "Charged", factor: 14 }],
  PA: [{ name: "Plunging", factor: 18 }],
  ES: [{ name: "Skill", factor: 20 }],
  EB: [{ name: "Burst", factor: 30 }],
};

const ACTIVE_TALENTS: AppCharacter["activeTalents"] = {
  NAs: { name: "Normal Attacks", description: "" },
  ES: { name: "Elemental Skill", description: "" },
  EB: { name: "Elemental Burst", description: "" },
};

const PASSIVE_TALENTS: AppCharacter["passiveTalents"] = [
  { name: "Ascension Passive 1", description: "" },
  { name: "Ascension Passive 2", description: "" },
  { name: "Utility Passive", description: "" },
];

const CONSTELLATION: AppCharacter["constellation"] = [];

export const __characters: AppCharacter[] = [
  {
    code: 1,
    name: __EMockCharacter.BASIC,
    icon: "",
    sideIcon: "",
    nation: "mondstadt",
    rarity: 5,
    vision: "pyro",
    weaponType: "sword",
    EBcost: 40,
    statBases: STATS,
    statBonus: { type: "atk_", value: 6 },
    talentLvBonus: {
      ES: 3,
      EB: 5,
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
  {
    code: 2,
    name: __EMockCharacter.TARTAGLIA,
    icon: "",
    sideIcon: "",
    nation: "liyue",
    rarity: 5,
    vision: "hydro",
    weaponType: "bow",
    EBcost: 60,
    statBases: STATS,
    statBonus: { type: "cRate_", value: 4.8 },
    talentLvBonus: {
      ES: 5,
      EB: 3,
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
  {
    code: 3,
    name: __EMockCharacter.CATALYST,
    icon: "",
    sideIcon: "",
    nation: "inazuma",
    rarity: 5,
    vision: "electro",
    weaponType: "catalyst",
    EBcost: 80,
    statBases: STATS,
    statBonus: { type: "cDmg_", value: 9.6 },
    talentLvBonus: {
      NAs: 3,
      ES: 5,
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
  {
    code: 4,
    name: __EMockCharacter.ES_CALC_CONFIG,
    icon: "",
    sideIcon: "",
    nation: "sumeru",
    rarity: 5,
    vision: "cryo",
    weaponType: "polearm",
    EBcost: 90,
    statBases: STATS,
    statBonus: { type: "def_", value: 9 },
    talentLvBonus: {
      NAs: 3,
      EB: 5,
    },
    calcListConfig: {
      ES: {
        scale: 3,
        basedOn: "em",
        attPatt: "EB",
      },
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
  {
    code: 5,
    name: __EMockCharacter.ANEMO,
    icon: "",
    sideIcon: "",
    nation: "natlan",
    rarity: 5,
    vision: "anemo",
    weaponType: "claymore",
    EBcost: 90,
    statBases: STATS,
    statBonus: { type: "def_", value: 9 },
    talentLvBonus: {
      NAs: 3,
      EB: 5,
    },
    calcListConfig: {
      ES: {
        scale: 3,
        basedOn: "em",
        attPatt: "EB",
      },
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
  {
    code: 6,
    name: __EMockCharacter.SKIRK,
    icon: "",
    sideIcon: "",
    nation: "outland",
    rarity: 5,
    vision: "cryo",
    weaponType: "sword",
    EBcost: 0,
    statBases: STATS,
    statBonus: { type: "cRate_", value: 4.8 },
    talentLvBonus: {
      ES: 5,
      EB: 3,
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
  {
    code: 7,
    name: __EMockCharacter.PYRO,
    icon: "",
    sideIcon: "",
    nation: "natlan",
    rarity: 5,
    vision: "pyro",
    weaponType: "bow",
    EBcost: 0,
    statBases: STATS,
    statBonus: { type: "cRate_", value: 4.8 },
    talentLvBonus: {
      ES: 5,
      EB: 3,
    },
    calcList: CALC_LIST,
    activeTalents: ACTIVE_TALENTS,
    passiveTalents: PASSIVE_TALENTS,
    constellation: CONSTELLATION,
  },
];

$AppCharacter.populate(__characters);
