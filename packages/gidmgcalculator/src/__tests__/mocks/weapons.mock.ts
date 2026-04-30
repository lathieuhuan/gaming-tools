import { AppWeapon } from "@/types";
import { __weaponMockup } from "../utils/weaponMockup";

export const WeaponMock = {
  BOW: 11,
  CATALYST: 36,
  CLAYMORE: 59,
  POLEARM: 84,
  SWORD: 108,
} as const;

export const WEAPON_MOCKS: AppWeapon[] = [
  __weaponMockup(WeaponMock.BOW, {
    type: "bow",
  }),
  __weaponMockup(WeaponMock.CATALYST, {
    type: "catalyst",
  }),
  __weaponMockup(WeaponMock.CLAYMORE, {
    type: "claymore",
  }),
  __weaponMockup(WeaponMock.POLEARM, {
    type: "polearm",
  }),
  __weaponMockup(WeaponMock.SWORD, {
    type: "sword",
  }),
];
