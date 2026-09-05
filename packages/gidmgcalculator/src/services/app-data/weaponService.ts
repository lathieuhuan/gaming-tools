import type { AppWeapon } from "@/types";
import { weaponCache } from "./cache";
import { getCachedAppData } from "./selector";

export function getAppWeapons(): AppWeapon[] {
  return getCachedAppData()?.weapons || [];
}

export function getAppWeapon(code: number) {
  if (!code) {
    // no weapon with code 0
    return undefined;
  }

  const cachedWeapon = weaponCache.get(code);

  if (cachedWeapon) {
    return cachedWeapon;
  }

  const data = getAppWeapons().find((weapon) => weapon.code === code);

  if (data) {
    weaponCache.set(code, data);
    return data;
  }

  return undefined;
}
