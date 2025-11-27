import type { IWeapon, WeaponType } from "@/types";

import { Weapon } from "@/models/base";
import { $AppWeapon } from "@/services";

export class MainWeapon extends Weapon {
  static DEFAULT(type: WeaponType, ID?: number) {
    const code = Weapon.DEFAULT_CODE[type];
    return new MainWeapon({ ID, code, type }, $AppWeapon.get(code)!);
  }

  update(info: Partial<IWeapon>) {
    const data = info.code && info.code !== this.code ? $AppWeapon.get(info.code)! : this.data;

    return new MainWeapon({ ...this, ...info }, data);
  }

  clone(updateData: Partial<Pick<IWeapon, "level" | "refi">> = {}) {
    return new MainWeapon({ ...this, ...updateData }, this.data);
  }
}
