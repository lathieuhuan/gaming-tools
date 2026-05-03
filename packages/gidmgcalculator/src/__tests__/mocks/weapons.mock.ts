import { AppWeapon } from "@/types";
import { __appWeaponMock } from "../utils/appWeaponMock";

export const WeaponMock = {
  BOW: 11,
  CATALYST: 36,
  CLAYMORE: 59,
  POLEARM: 84,
  SWORD: 108,
} as const;

export const WEAPON_MOCKS: AppWeapon[] = [
  __appWeaponMock(WeaponMock.BOW, {
    type: "bow",
  }),
  __appWeaponMock(WeaponMock.CATALYST, {
    type: "catalyst",
  }),
  __appWeaponMock(WeaponMock.CLAYMORE, {
    type: "claymore",
  }),
  __appWeaponMock(WeaponMock.POLEARM, {
    type: "polearm",
  }),
  __appWeaponMock(WeaponMock.SWORD, {
    type: "sword",
  }),
];
