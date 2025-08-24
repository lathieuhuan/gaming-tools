import { AttributeStat, Level, LEVELS } from "@Calculation";
import { GOODAscendable, GOODStatKey } from "@Src/types/GOOD.types";

export function toGOODKey(name: string) {
  let result = "";
  let spaceAhead = true;

  for (const c of name) {
    if (!["-", "'", '"'].includes(c)) {
      if (c === " ") {
        spaceAhead = true;
      } else {
        result += spaceAhead ? c.toUpperCase() : c;
        spaceAhead = false;
      }
    }
  }
  return result;
}

export function convertGOODLevel(entity: GOODAscendable): Level {
  const levelCaps = [20, 40, 50, 60, 70, 80, 90];
  const level = `${entity.level}/${levelCaps[entity.ascension]}` as Level;
  return LEVELS.includes(level) ? level : "1/20";
}

const goodFormatMap: Record<GOODStatKey, AttributeStat> = {
  atk: "atk",
  atk_: "atk_",
  hp: "hp",
  hp_: "hp_",
  def: "def",
  def_: "def_",
  eleMas: "em",
  enerRech_: "er_",
  critRate_: "cRate_",
  critDMG_: "cDmg_",
  heal_: "healB_",
  pyro_dmg_: "pyro",
  hydro_dmg_: "hydro",
  electro_dmg_: "electro",
  geo_dmg_: "geo",
  anemo_dmg_: "anemo",
  dendro_dmg_: "dendro",
  cryo_dmg_: "cryo",
  physical_dmg_: "phys",
};

export function convertGOODStatKey(key: GOODStatKey): AttributeStat | undefined {
  return goodFormatMap[key];
}
