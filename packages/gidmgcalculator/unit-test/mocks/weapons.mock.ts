import { AppWeapon } from "../../src/calculation";
import { $AppWeapon } from "../../src/services";

export enum __EMockWeapon {
  SWORD = 1,
  BOW = 2,
}

export const __weapons: AppWeapon[] = [
  {
    code: __EMockWeapon.SWORD,
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
    code: __EMockWeapon.BOW,
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

$AppWeapon.populate(__weapons);
