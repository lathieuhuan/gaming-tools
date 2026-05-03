import { AppWeapon } from "@/types";

export function __appWeaponMock(code: number, data?: Partial<AppWeapon>): AppWeapon {
  return {
    code,
    icon: "",
    name: "",
    rarity: 5,
    type: "sword",
    mainStatScale: "46",
    subStat: {
      type: "atk_",
      scale: "10.8%",
    },
    ...data,
  };
}
