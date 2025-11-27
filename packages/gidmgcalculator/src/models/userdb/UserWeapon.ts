import type { AppWeapon } from "@/types";
import type { IUserWeapon } from "@/types/user-entity";

import { Weapon, WeaponConstructInfo } from "@/models/base";

type UserWeaponConstructInfo = WeaponConstructInfo & {
  owner?: string | null;
  setupIDs?: number[];
};

export class UserWeapon extends Weapon implements IUserWeapon {
  owner: string | null;
  setupIDs?: number[];

  constructor(info: UserWeaponConstructInfo, data: AppWeapon) {
    super(info, data);

    this.owner = info.owner || null;
    this.setupIDs = info.setupIDs;
  }
}
