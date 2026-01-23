import type { AppWeapon, WeaponType } from "@/types";

const cache = new Map<number, AppWeapon>();

class AppWeaponService {
  weapons: AppWeapon[] = [];

  populate(weapons: AppWeapon[]) {
    cache.clear();
    this.weapons = weapons;
  }

  getAll(type?: WeaponType): AppWeapon[];
  getAll<T>(transform: (weapon: AppWeapon) => T): T[];
  getAll<T>(arg?: WeaponType | ((weapon: AppWeapon) => T)): AppWeapon[] | T[] {
    if (typeof arg === "string") {
      const weaponsByType = this.weapons.reduce<AppWeapon[]>((acc, weapon) => {
        return weapon.type === arg ? acc.concat(weapon) : acc;
      }, []);

      return weaponsByType;
    }

    if (typeof arg === "function") {
      return this.weapons.map((weapon) => arg(weapon));
    }

    return this.weapons.map((weapon) => weapon);
  }

  get(code: number) {
    if (!code) {
      // no weapon with code 0
      return undefined;
    }

    const cachedWeapon = cache.get(code);

    if (cachedWeapon) {
      return cachedWeapon;
    }

    const data = this.weapons.find((weapon) => weapon.code === code);

    if (data) {
      cache.set(code, data);
      return data;
    }

    return undefined;
  }
}

export const $AppWeapon = new AppWeaponService();
