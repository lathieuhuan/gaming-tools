import type { AppWeapon, WeaponBuff } from "@/types";
import Array_ from "../Array";
import { parseWeaponDesc } from "./parseWeaponDesc";

export const getWeaponBuffDesc = (descriptions: AppWeapon["descriptions"], buff: WeaponBuff, refi: number) => {
  if (descriptions?.length) {
    const parsedFrags: string[] = [];

    for (const frag of Array_.toArray(buff.description ?? 0)) {
      const description = typeof frag === "number" ? descriptions[frag] : frag;
      parsedFrags.push(parseWeaponDesc(description ?? "", refi));
    }
    return parsedFrags.join(" ");
  }
  return "";
};
