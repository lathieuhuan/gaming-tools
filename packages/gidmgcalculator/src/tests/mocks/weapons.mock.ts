import { AppWeapon } from "@/types";

export const MockWeapon = {
  SWORD: 1,
  BOW: 2,
} as const;

export const MOCK_WEAPONS: AppWeapon[] = [
  {
    code: MockWeapon.SWORD,
    icon: "",
    name: "Sword",
    rarity: 5,
    type: "sword",
    mainStatScale: "46",
    subStat: {
      type: "atk_",
      scale: "10.8%",
    },
  },
  {
    code: MockWeapon.BOW,
    icon: "",
    name: "Sword",
    rarity: 5,
    type: "bow",
    mainStatScale: "42",
    subStat: {
      type: "cDmg_",
      scale: "19.2%",
    },
  },
];
