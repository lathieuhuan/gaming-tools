import { Object_ } from "ron-utils";
import type { PartiallyOptional } from "rond";

import type {
  AppWeapon,
  EquipmentRelationData,
  RawWeapon,
  Level,
  WeaponKey,
  WeaponStateData,
  WeaponType,
} from "@/types";
import type { Clonable } from "../interfaces";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";
import { EquipmentRelation } from "../EquipmentRelation";
import { WeaponState } from "./WeaponState";

type WeaponConstructOptions = {
  state?: Partial<WeaponStateData>;
  relation?: Partial<EquipmentRelationData>;
};

@FlatGetters("key", ["ID", "code", "type"])
@FlatGetters("state", ["level", "refi", "bareLv", "ascension", "mainStatValue", "subStatValue"])
@FlatGetters("relation", ["owner", "setupIDs"])
export class Weapon implements Clonable<Weapon> {
  key: WeaponKey;
  state: WeaponState;
  relation: EquipmentRelation;

  readonly data: AppWeapon;

  declare ID: number;
  declare code: number;
  declare type: WeaponType;
  declare level: Level;
  declare refi: number;
  declare bareLv: number;
  declare ascension: number;
  declare mainStatValue: number;
  declare subStatValue: number;
  declare owner?: number;
  declare setupIDs?: number[];

  static DEFAULT_CODE: Record<WeaponType, number> = {
    bow: 11,
    catalyst: 36,
    claymore: 59,
    polearm: 84,
    sword: 108,
  };

  constructor(
    key: PartiallyOptional<WeaponKey, "code">,
    data: AppWeapon,
    options: WeaponConstructOptions = {}
  ) {
    const { code = Weapon.DEFAULT_CODE[key.type] } = key;

    this.key = {
      ID: key.ID,
      code,
      type: key.type,
    };
    this.state = new WeaponState(data, options.state);
    this.relation = new EquipmentRelation(options.relation);
    this.data = data;
  }

  serialize(): RawWeapon {
    return Weapon.serialize(this);
  }

  clone(options: WeaponConstructOptions = {}) {
    return new Weapon(this.key, this.data, {
      state: {
        ...this.state,
        ...options.state,
      },
      relation: {
        ...this.relation,
        ...options.relation,
      },
    });
  }

  // ===== STATIC =====

  static serialize(weapon: RawWeapon): RawWeapon {
    return Object_.patch<RawWeapon>(
      {
        ID: weapon.ID,
        code: weapon.code,
        type: weapon.type,
        level: weapon.level,
        refi: weapon.refi,
      },
      {
        owner: weapon.owner,
        setupIDs: weapon.setupIDs,
      }
    );
  }

  static extractCore(weapon: RawWeapon): WeaponKey & WeaponStateData {
    return Object_.extract(weapon, ["ID", "code", "type", "level", "refi"]);
  }
}
