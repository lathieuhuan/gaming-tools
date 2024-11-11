import { AppCharacter } from "../src/backend";

export enum EMockCharacter {
  BASIC = "BASIC",
  TARTAGLIA = "Tartaglia",
}

const STATS: AppCharacter["stats"] = [
  [100, 10, 50],
  [300, 40, 100],
  [1000, 60, 120],
  [2000, 80, 140],
  [3000, 100, 160],
  [4000, 120, 180],
  [5000, 140, 200],
  [6000, 160, 250],
  [7000, 180, 300],
  [8000, 200, 350],
  [9000, 220, 400],
  [10000, 240, 450],
  [11000, 260, 500],
  [12000, 280, 550],
];

const CALC_LIST: AppCharacter["calcList"] = {
  NA: [
    { name: "Hit 1", multFactors: 10 },
    { name: "Hit 2", multFactors: 12 },
  ],
  CA: [{ name: "Charged", multFactors: 14 }],
  PA: [{ name: "Plunging", multFactors: 18 }],
  ES: [{ name: "Skill", multFactors: 20 }],
  EB: [{ name: "Burst", multFactors: 30 }],
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

export const characters: AppCharacter[] = [
  {
    code: 1,
    name: EMockCharacter.BASIC,
    icon: "",
    sideIcon: "",
    nation: "mondstadt",
    rarity: 5,
    vision: "pyro",
    weaponType: "sword",
    EBcost: 40,
    stats: STATS,
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
    name: EMockCharacter.TARTAGLIA,
    icon: "",
    sideIcon: "",
    nation: "liyue",
    rarity: 5,
    vision: "hydro",
    weaponType: "bow",
    EBcost: 60,
    stats: STATS,
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
