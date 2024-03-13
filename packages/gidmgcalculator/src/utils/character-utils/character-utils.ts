import type { Character, Level } from "@Src/types";
import { $AppSettings } from "@Src/services";
import { getBareLv } from "../utils";
import { BASE_REACTION_DAMAGE, TALENT_LV_MULTIPLIERS } from "./character-stats";

export function createCharacter(name: string, info: Partial<Character>): Character {
  const { charLevel, charCons, charNAs, charES, charEB } = $AppSettings.get();

  return {
    name: name,
    level: info?.level || charLevel,
    NAs: info?.NAs || charNAs,
    ES: info?.ES || charES,
    EB: info?.EB || charEB,
    cons: info?.cons || charCons,
  };
}

export function getTalentMult(scale: number, level: number): number {
  return scale ? TALENT_LV_MULTIPLIERS[scale][level] : 1;
}

export function getBaseRxnDmg(level: Level): number {
  return BASE_REACTION_DAMAGE[getBareLv(level)];
}
