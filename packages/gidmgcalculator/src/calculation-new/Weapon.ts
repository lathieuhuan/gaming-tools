import { AppWeapon, Level, WeaponType } from "@/calculation/types";

export interface IWeapon {
  ID: number;
  type: WeaponType;
  code: number;
  level: Level;
  refi: number;
}

export class WeaponC implements IWeapon {
  ID: number;
  type: WeaponType;
  code: number;
  level: Level;
  refi: number;
  data: AppWeapon;

  constructor(weapon: IWeapon, data: AppWeapon) {
    this.ID = weapon.ID;
    this.type = weapon.type;
    this.code = weapon.code;
    this.level = weapon.level;
    this.refi = weapon.refi;
    this.data = data;
  }
}
