import { WeaponType } from "@Backend";

import { $AppSettings } from "@Src/services";
import type { Weapon } from "@Src/types";

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
}
