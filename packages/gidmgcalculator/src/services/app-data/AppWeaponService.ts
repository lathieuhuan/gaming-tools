import type { AppWeapon, WeaponType } from "@/types";

const map = new Map<number, AppWeapon>();
let weapons_: AppWeapon[] = [];

function populate(weapons: AppWeapon[]) {
  map.clear();
  weapons_ = weapons;
}

function getAll(type?: WeaponType): AppWeapon[];
function getAll<T>(transform: (weapon: AppWeapon) => T): T[];
function getAll<T>(arg?: WeaponType | ((weapon: AppWeapon) => T)): AppWeapon[] | T[] {
  if (typeof arg === "string") {
    const weaponsByType = weapons_.reduce<AppWeapon[]>((acc, weapon) => {
      return weapon.type === arg ? acc.concat(weapon) : acc;
    }, []);

    return weaponsByType;
  }

  if (typeof arg === "function") {
    return weapons_.map((weapon) => arg(weapon));
  }

  return weapons_.map((weapon) => weapon);
}

function get(code: number) {
  if (!code) {
    // no weapon with code 0
    return undefined;
  }

  const cachedWeapon = map.get(code);

  if (cachedWeapon) {
    return cachedWeapon;
  }

  const data = weapons_.find((weapon) => weapon.code === code);

  if (data) {
    map.set(code, data);
    return data;
  }

  return undefined;
}

export const $AppWeapon = {
  populate,
  getAll,
  get,
};
