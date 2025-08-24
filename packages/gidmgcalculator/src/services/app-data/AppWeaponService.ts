import type { AppWeapon, WeaponType } from "@Calculation";
import type { Weapon } from "@Src/types";
import type { GOODWeapon } from "@Src/types/GOOD.types";
import type { DataControl } from "./app-data.types";
import { convertGOODLevel, toGOODKey } from "./utils";

export type ConvertedWeapon = Weapon & { data: AppWeapon };

export class AppWeaponService {
  private weapons: Array<DataControl<AppWeapon>> = [];

  populate(weapons: AppWeapon[]) {
    this.weapons = weapons.map((dataWeapon) => ({
      status: "fetched",
      data: dataWeapon,
    }));
  }

  getAll(type?: WeaponType): AppWeapon[];
  getAll<T>(transform: (weapon: AppWeapon) => T): T[];
  getAll<T>(arg?: WeaponType | ((weapon: AppWeapon) => T)): AppWeapon[] | T[] {
    if (typeof arg === "string") {
      return this.weapons.reduce<AppWeapon[]>((acc, weapon) => {
        if (weapon.data.type === arg) {
          acc.push(weapon.data);
        }
        return acc;
      }, []);
    }
    if (typeof arg === "function") {
      return this.weapons.map((weapon) => arg(weapon.data));
    }

    return this.weapons.map((weapon) => weapon.data);
  }

  get(code: number) {
    const control = this.weapons.find((weapon) => weapon.data.code === code);
    return control?.data;
  }

  convertGOOD(weapon: GOODWeapon, seedId: number): ConvertedWeapon | undefined {
    const data = this.weapons.find(({ data }) => toGOODKey(data.name) === weapon.key)?.data;

    if (!data) {
      return undefined;
    }

    return {
      ID: seedId,
      code: data.code,
      type: data.type,
      level: convertGOODLevel(weapon),
      refi: weapon.refinement,
      data,
    };
  }
}
