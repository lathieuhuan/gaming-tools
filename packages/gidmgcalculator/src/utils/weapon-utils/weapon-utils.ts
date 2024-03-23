import type { Level, Weapon, WeaponType } from "@Src/types";
import { LEVELS } from "@Src/constants";
import { $AppSettings } from "@Src/services";
import { Calculation_ } from "../calculation-utils";
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

export class Weapon_ {
  static create({ type, code }: CreateWeaponArgs, ID = Date.now()): Weapon {
    const { wpLevel, wpRefi } = $AppSettings.get();

    return {
      ID: ID,
      type: type,
      code: code || DEFAULT_WEAPON_CODE[type],
      level: wpLevel,
      refi: wpRefi,
    };
  }

  static getDefaultCode(type: WeaponType) {
    return DEFAULT_WEAPON_CODE[type];
  }

  static getMainStatValue(level: Level, scale: string): number {
    return BASE_ATTACK_TYPE[scale][LEVELS.indexOf(level)];
  }

  static getSubStatValue(level: Level, scale: string): number {
    const bareLv = Calculation_.getBareLv(level);
    const index = bareLv === 1 ? 0 : bareLv === 20 ? 1 : (bareLv - 20) / 10;
    return SUBSTAT_SCALE[scale][index];
  }
}
