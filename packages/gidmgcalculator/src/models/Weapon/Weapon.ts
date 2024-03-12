import type { Level, WeaponType } from "@Src/types";
import { LEVELS } from "@Src/constants";
import { $AppSettings } from "@Src/services";
import { getBareLv } from "@Src/utils";
import { BASE_ATTACK_TYPE, SUBSTAT_SCALE } from "./weapon-stats";

const DEFAULT_WEAPON_CODE = {
  bow: 11,
  catalyst: 36,
  claymore: 59,
  polearm: 84,
  sword: 108,
};

type CreateWeaponArgs = {
  type: WeaponType;
  code?: number;
};

export class Weapon {
  ID: number;
  type: WeaponType;
  code: number;
  level: Level;
  refi: number;

  constructor({ type, code }: CreateWeaponArgs, ID = Date.now()) {
    const { wpLevel, wpRefi } = $AppSettings.get();

    this.ID = ID;
    this.type = type;
    this.code = code || DEFAULT_WEAPON_CODE[type];
    this.level = wpLevel;
    this.refi = wpRefi;
  }

  static getMainStatValue(level: Level, scale: string) {
    return BASE_ATTACK_TYPE[scale][LEVELS.indexOf(level)];
  }

  static getSubStatValue(level: Level, scale: string) {
    const bareLv = getBareLv(level);
    const index = bareLv === 1 ? 0 : bareLv === 20 ? 1 : (bareLv - 20) / 10;
    return SUBSTAT_SCALE[scale][index];
  }
}
