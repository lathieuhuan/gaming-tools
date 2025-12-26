import { useRef } from "react";

import type { AppWeapon } from "@/types";
import { $AppWeapon } from "@/services";

export function useWeaponData() {
  const data = useRef<Record<number, AppWeapon>>({});

  const get = (code: number) => {
    if (!data.current[code]) {
      data.current[code] = $AppWeapon.get(code)!;
    }

    return data.current[code];
  };

  return { get };
}
