import { AppWeapon, WeaponBuff } from "@Src/calculation/types";
import Array_ from "../array-utils";
import { parseWeaponDescription } from "./parseWeaponDescription";

export const getWeaponBuffDescription = (descriptions: AppWeapon["descriptions"], buff: WeaponBuff, refi: number) => {
  if (descriptions?.length) {
    const parsedFrags: string[] = [];

    for (const frag of Array_.toArray(buff.description ?? 0)) {
      const description = typeof frag === "number" ? descriptions[frag] : frag;
      parsedFrags.push(parseWeaponDescription(description ?? "", refi));
    }
    return parsedFrags.join(" ");
  }
  return "";
};
