import type { Level } from "@Src/types";
import { getBareLv } from "@Src/utils";
import { $AppSettings } from "@Src/services";
import { BASE_REACTION_DAMAGE, TALENT_LV_MULTIPLIERS } from "./character-stats";

export class Character {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;

  constructor(name: string, info: Partial<Character>) {
    const { charLevel, charCons, charNAs, charES, charEB } = $AppSettings.get();

    this.name = name;
    this.level = info?.level || charLevel;
    this.NAs = info?.NAs || charNAs;
    this.ES = info?.ES || charES;
    this.EB = info?.EB || charEB;
    this.cons = info?.cons || charCons;
  }

  static getTalentMult(scale: number, level: number): number {
    return scale ? TALENT_LV_MULTIPLIERS[scale][level] : 1;
  }

  static getBaseRxnDmg(level: Level): number {
    return BASE_REACTION_DAMAGE[getBareLv(level)];
  }
}
