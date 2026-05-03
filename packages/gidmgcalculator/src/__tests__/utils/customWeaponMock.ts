import { createWeapon } from "@/logic/entity.logic";
import { $AppWeapon } from "@/services";
import { AppWeapon } from "@/types";
import { ExactOmit } from "rond";

export type __CustomWeaponMockOptions = Partial<ExactOmit<AppWeapon, "code" | "type">>;

export function __customWeaponMock(code: number, options: __CustomWeaponMockOptions = {}) {
  const data: AppWeapon = {
    ...$AppWeapon.get(code)!,
    ...options,
  };

  return createWeapon({ code, type: data.type }, data);
}
