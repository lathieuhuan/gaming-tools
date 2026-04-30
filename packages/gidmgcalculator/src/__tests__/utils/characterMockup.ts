import { AppCharacter } from "@/types";

export function __characterMockup(code: number, data?: Partial<AppCharacter>): AppCharacter {
  return {
    code,
    name: "",
    icon: "",
    sideIcon: "",
    nation: "mondstadt",
    rarity: 5,
    vision: "pyro",
    weaponType: "sword",
    EBcost: 40,
    statBases: {
      hp: { level: 1000, ascension: 100 },
      atk: { level: 100, ascension: 10 },
      def: { level: 50, ascension: 5 },
    },
    statBonus: { type: "atk_", value: 6 },
    talentLvBonus: {
      ES: 3,
      EB: 5,
    },
    calcList: {
      NA: [
        { name: "Hit 1", factor: 10 },
        { name: "Hit 2", factor: 12 },
      ],
      CA: [{ name: "Charged", factor: 14 }],
      PA: [{ name: "Plunging", factor: 18 }],
      ES: [{ name: "Skill", factor: 20 }],
      EB: [{ name: "Burst", factor: 30 }],
    },
    activeTalents: {
      NAs: { name: "Normal Attacks", description: "" },
      ES: { name: "Elemental Skill", description: "" },
      EB: { name: "Elemental Burst", description: "" },
    },
    passiveTalents: [],
    constellation: [],
    ...data,
  };
}
