import type { AppCharacter, AttributeStat, ElementType, Level, RawCharacter } from "@/types";
import type {
  GOODArtifact,
  GOODAscendable,
  GOODCharacter,
  GOODStatKey,
  GOODWeapon,
} from "@/types/GOOD";

import { DESCENDING_LEVEL_CAPS, ELEMENT_TYPES, LEVELS } from "@/constants/global";
import { getAppArtifacts, getAppCharacters, getAppWeapons } from "@/services/app-data";
import { createArtifact, createWeapon } from "./entity.logic";

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
  let level: Level | undefined;

  if (entity.level > 90) {
    level = `${entity.level}/${entity.level}` as Level;
  } //
  else {
    for (let i = 0; i < DESCENDING_LEVEL_CAPS.length; i++) {
      const thisCap = DESCENDING_LEVEL_CAPS[i];

      if (entity.level === thisCap) {
        const ascensionCaps = DESCENDING_LEVEL_CAPS.toReversed();

        level = `${entity.level}/${ascensionCaps[entity.ascension]}` as Level;
        break;
      }

      if (entity.level > thisCap) {
        // thisCap starts from 80 because greater than or equal to 90 is already handled

        const higherCap = DESCENDING_LEVEL_CAPS[i - 1];
        const average = (thisCap + higherCap) / 2;
        const bareLv = entity.level >= average ? higherCap : thisCap;

        level = `${bareLv}/${higherCap}` as Level;
        break;
      }
    }

    // entity.level < 20
    if (level === undefined) {
      return entity.level >= (1 + 20) / 2 ? "20/20" : "1/20";
    }
  }

  // final check
  return LEVELS.includes(level) ? level : "1/20";
}

const GOOD_FORMAT_MAP: Record<GOODStatKey, AttributeStat> = {
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
  return GOOD_FORMAT_MAP[key];
}

export function findGOODCharacter(key: string): AppCharacter | undefined {
  if (!key) {
    return undefined;
  }

  let GOODName: string | undefined;

  if (key.slice(0, 8) === "Traveler") {
    const prefix = key.slice(8); // e.g. "TravelerAnemo" -> "Anemo"

    if (prefix && ELEMENT_TYPES.includes(prefix.toLowerCase() as ElementType)) {
      GOODName = prefix ? `${prefix} Traveler` : undefined;
    }
  } else {
    GOODName = key;
  }

  return getAppCharacters().find((item) => item.name === GOODName || item.GOOD === GOODName);
}

export type GOODCharacterConvertReturn = {
  basic: RawCharacter;
  data: AppCharacter;
};

export function convertGOODCharacter(
  character: GOODCharacter,
): GOODCharacterConvertReturn | undefined {
  //
  const data = findGOODCharacter(character.key);

  if (!data) {
    return undefined;
  }

  return {
    basic: {
      code: data.code,
      level: convertGOODLevel(character),
      cons: character.constellation,
      NAs: character.talent.auto,
      ES: character.talent.skill,
      EB: character.talent.burst,
      enhanced: false,
    },
    data,
  };
}

export function convertGOODWeapon(weapon: GOODWeapon, ID: number) {
  const data = getAppWeapons().find((data) => toGOODKey(data.name) === weapon.key);

  if (!data) {
    return undefined;
  }

  return createWeapon(
    {
      ID,
      code: data.code,
      type: data.type,
      level: convertGOODLevel(weapon),
      refi: weapon.refinement,
    },
    data,
  );
}

export function convertGOODArtifact(artifact: GOODArtifact, ID: number) {
  if (artifact.rarity < 4) {
    return undefined;
  }

  const data = getAppArtifacts().find((data) => toGOODKey(data.name) === artifact.setKey);

  if (!data) {
    return undefined;
  }

  return createArtifact(
    {
      ID,
      code: data.code,
      type: artifact.slotKey,
      rarity: artifact.rarity,
      mainStatType: convertGOODStatKey(artifact.mainStatKey) || "atk",
      subStats: artifact.substats.map((substat) => ({
        type: convertGOODStatKey(substat.key) || "atk",
        value: substat.value,
      })),
      level: artifact.level,
    },
    data,
  );
}
