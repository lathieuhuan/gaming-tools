import { CalcArtifact, CalcWeapon, UserArtifact, UserWeapon } from "@Src/types";

interface Options {
  ID?: number;
  owner?: string;
  setupIDs?: number[];
}

export class Item_ {
  static isUserWeapon(item: UserWeapon | UserArtifact): item is UserWeapon {
    return "refi" in item;
  }

  static calcItemToUserItem(item: CalcArtifact, options?: Options): UserArtifact;
  static calcItemToUserItem(item: CalcWeapon, options?: Options): UserWeapon;
  static calcItemToUserItem(item: CalcArtifact | CalcWeapon, options?: Options): UserArtifact | UserWeapon {
    const { ID = item.ID, owner = null, setupIDs } = options || {};

    return {
      ...item,
      ID,
      owner,
      ...(setupIDs ? { setupIDs } : undefined),
    };
  }

  static userItemToCalcItem(item: UserWeapon, newID?: number): CalcWeapon;
  static userItemToCalcItem(item: UserArtifact, newID?: number): CalcArtifact;
  static userItemToCalcItem(item: UserWeapon | UserArtifact): CalcWeapon | CalcArtifact {
    const { owner, setupIDs, ...info } = item;
    return info;
  }
}
