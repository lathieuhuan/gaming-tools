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
  key?: Partial<WeaponKey>;
  state?: Partial<WeaponStateData>;
  relation?: Partial<EquipmentRelationData>;
};

@FlatGetters("key", ["ID", "code", "type"])
@FlatGetters("state", ["level", "refi", "bareLv", "ascension", "mainStatValue", "subStatValue"])
@FlatGetters("relation", ["owner", "setupIDs"])
export class Weapon implements Clonable<Weapon> {
  readonly key: WeaponKey;
  readonly state: WeaponState;
  readonly relation: EquipmentRelation;

  readonly data: AppWeapon;

  declare readonly ID: number;
  declare readonly code: number;
  declare readonly type: WeaponType;
  declare readonly level: Level;
  declare readonly refi: number;
  declare readonly bareLv: number;
  declare readonly ascension: number;
  declare readonly mainStatValue: number;
  declare readonly subStatValue: number;
  declare readonly owner?: number;
  declare readonly setupIDs?: number[];

  static TRAVELER_SWORD_CODE = 246;

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
    options: WeaponConstructOptions = {},
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
    const key = Object_.patch(this.key, options.key || {});

    return new Weapon(key, this.data, {
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
      },
    );
  }

  static iconOf(weaponType: WeaponType) {
    return WEAPON_TYPE_ICONS.find((item) => item.type === weaponType)?.src;
  }

  static allIcons(): WeaponTypeIcon[];
  static allIcons<T>(transform: (icons: WeaponTypeIcon) => T): T[];
  static allIcons<T>(transform?: (icons: WeaponTypeIcon) => T): WeaponTypeIcon[] | T[] {
    return transform ? WEAPON_TYPE_ICONS.map(transform) : WEAPON_TYPE_ICONS;
  }
}

type WeaponTypeIcon = { type: WeaponType; src: string };

const WEAPON_TYPE_ICONS: WeaponTypeIcon[] = [
  { type: "bow", src: "9/97/Weapon-class-bow-icon" },
  { type: "catalyst", src: "0/02/Weapon-class-catalyst-icon" },
  { type: "claymore", src: "5/51/Weapon-class-claymore-icon" },
  { type: "polearm", src: "9/91/Weapon-class-polearm-icon" },
  { type: "sword", src: "9/95/Weapon-class-sword-icon" },
];
