import { ARTIFACT_TYPES, AttributeStat, Level } from "@Calculation";

import type { ArtifactSubStat, UserArtifact, UserCharacter, UserWeapon } from "@/types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import { DOWNLOADED_DATA_VERSION } from "@/constants";
import Array_ from "@/utils/array-utils";
import Entity_ from "@/utils/entity-utils";
import { goodFormatMap } from "./util-maps";

const convertLevel = (level: any, ascension: any) => {
  const roundedLevel = Math.round(+level / 10) * 10;
  return `${roundedLevel || 1}/${ascension ? ascension * 10 + 30 : 20}` as Level;
};

const convertName = (str: string) => {
  let result = "";
  let spaceAhead = true;

  for (const c of str) {
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
};

const searchCharacterByKey = (key: any) => {
  return key ? $AppCharacter.getAll().find(({ name, GOOD }) => name === key || GOOD === key)?.name : undefined;
};

const searchWeaponByKey = (key: any) => {
  const weapon = $AppWeapon.getAll().find((item) => key === convertName(item.name));
  return weapon ? { code: weapon.code, type: weapon.type } : undefined;
};

const searchArtifactByKey = (key: any) => {
  return $AppArtifact.getAll().find((item) => key === convertName(item.name))?.code;
};

type Result = {
  version: number;
  characters: UserCharacter[];
  weapons: UserWeapon[];
  artifacts: UserArtifact[];
};

export function convertFromGoodFormat(data: any) {
  const result: Result = {
    version: DOWNLOADED_DATA_VERSION,
    characters: [],
    weapons: [],
    artifacts: [],
  };
  let seedID = Date.now();

  for (const character of data.characters || []) {
    let name;

    if (character.key.slice(0, 8) === "Traveler") {
      name = character.key.slice(8) + " Traveler";
    } else {
      name = searchCharacterByKey(character.key);
    }

    if (!name) continue;

    const charInfo: UserCharacter = {
      name,
      level: convertLevel(character.level, character.ascension),
      NAs: character.talent.auto,
      ES: character.talent.skill,
      EB: character.talent.burst,
      cons: character.constellation,
      weaponID: 0,
      artifactIDs: [null, null, null, null, null],
    };

    result.characters.push(charInfo);
  }

  for (const artifact of data.artifacts || []) {
    const { rarity, slotKey, level } = artifact;
    const code = searchArtifactByKey(artifact.setKey);

    if (!code || (rarity !== 4 && rarity !== 5)) continue;

    let mainStatType: AttributeStat = slotKey === "flower" ? "hp" : slotKey === "plume" ? "atk" : "atk_";
    const subStats: ArtifactSubStat[] = [];
    const owner = searchCharacterByKey(artifact.location) || null;

    if (artifact.mainStatKey && artifact.mainStatKey in goodFormatMap) {
      mainStatType = goodFormatMap[artifact.mainStatKey] as AttributeStat;
    }

    for (const { key, value } of artifact.substats) {
      let type: AttributeStat = "atk";

      if (key && key in goodFormatMap) {
        type = goodFormatMap[key] as AttributeStat;
      }
      subStats.push({ type, value });
    }
    const artifactID = seedID++;
    const newArtifact: UserArtifact = {
      ID: artifactID,
      type: slotKey,
      rarity,
      level,
      mainStatType,
      subStats,
      owner,
      code,
    };

    result.artifacts.push(newArtifact);

    if (owner) {
      const character = Array_.findByName(result.characters, owner);

      if (character) {
        character.artifactIDs[ARTIFACT_TYPES.indexOf(slotKey)] = artifactID;
      }
    }
  }

  for (const weapon of data.weapons || []) {
    const { code = 0, type = "sword" } = searchWeaponByKey(weapon.key) || {};
    const owner = searchCharacterByKey(weapon.location) || null;

    if (!code || (Entity_.getDefaultWeaponCode(type) === code && !owner)) continue;

    const weaponID = seedID++;
    const newWeapon: UserWeapon = {
      ID: weaponID,
      type,
      level: convertLevel(weapon.level, weapon.ascension),
      refi: weapon.refinement,
      owner,
      code,
    };
    result.weapons.push(newWeapon);

    if (owner) {
      const character = Array_.findByName(result.characters, owner);

      if (character) {
        character.weaponID = weaponID;
      }
    }
  }

  for (const character of result.characters) {
    if (!character.weaponID) {
      const { weaponType } = $AppCharacter.get(character.name)! || {};
      const weaponID = seedID++;
      const newWeapon = Entity_.createWeapon({ type: weaponType }, weaponID);

      result.weapons.unshift({
        ...newWeapon,
        owner: character.name,
      });

      character.weaponID = weaponID;
    }
  }

  return result;
}
