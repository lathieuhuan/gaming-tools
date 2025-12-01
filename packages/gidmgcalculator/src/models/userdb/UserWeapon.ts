import type { AppWeapon, IDbWeapon } from "@/types";

import { Weapon } from "@/models/base";
import Object_ from "@/utils/Object";

type UserWeaponFromOptions = {
  ID?: number;
  owner?: string;
  setupIDs?: number[];
};

export class UserWeapon extends Weapon implements IDbWeapon {
  owner?: string;
  setupIDs?: number[];

  constructor(info: IDbWeapon, data: AppWeapon) {
    super(info, data);

    Object_.optionalAssign<UserWeapon>(this, {
      owner: info.owner,
      setupIDs: info.setupIDs,
    });
  }

  static from(weapon: Weapon, options: UserWeaponFromOptions = {}): IDbWeapon {
    const { ID = weapon.ID, owner, setupIDs } = options;

    return new UserWeapon({ ...weapon, ID, owner, setupIDs }, weapon.data);
  }

  serialize(): IDbWeapon {
    const basic = super.serialize();

    return Object_.optionalAssign<IDbWeapon>(basic, {
      owner: this.owner,
      setupIDs: this.setupIDs,
    });
  }
}
