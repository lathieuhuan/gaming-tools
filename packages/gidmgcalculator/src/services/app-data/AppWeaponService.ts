import type { AppWeapon, WeaponType } from "@/types";
import type { DataControl } from "./app-data.types";

const map = new Map<number, AppWeapon>();

export class AppWeaponService {
  private weapons: Array<DataControl<AppWeapon>> = [];

  populate(weapons: AppWeapon[]) {
    map.clear();

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
    if (!code) {
      return undefined;
    }

    const cached = map.get(code);

    if (cached) {
      return cached;
    }

    const data = this.weapons.find((weapon) => weapon.data.code === code)?.data;

    if (data) {
      map.set(code, data);
      return data;
    }

    return undefined;
  }
}
