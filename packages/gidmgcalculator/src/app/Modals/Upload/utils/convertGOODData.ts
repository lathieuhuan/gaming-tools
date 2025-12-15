import type { IDbArtifact, IDbCharacter, IDbWeapon } from "@/types";
import type { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD";

import { DOWNLOADED_DATA_VERSION } from "@/constants";
import { $AppCharacter } from "@/services";
import Array_ from "@/utils/Array";
import { createWeaponBasic } from "@/utils/entity";
import {
  convertGOODArtifact,
  convertGOODCharacter,
  convertGOODWeapon,
  findGOODCharacter,
} from "@/utils/GOOD";
import IdStore from "@/utils/IdStore";

type GOODData = {
  characters?: GOODCharacter[];
  weapons?: GOODWeapon[];
  artifacts?: GOODArtifact[];
};

type Result = {
  version: number;
  characters: IDbCharacter[];
  weapons: IDbWeapon[];
  artifacts: IDbArtifact[];
};

export function convertGOODData(data: GOODData) {
  const result: Result = {
    version: DOWNLOADED_DATA_VERSION,
    characters: [],
    weapons: [],
    artifacts: [],
  };
  const idStore = new IdStore();

  for (const GOODCharacter of data.characters || []) {
    const character = convertGOODCharacter(GOODCharacter);

    if (character) {
      result.characters.push({
        ...character.basic,
        weaponID: 0,
        artifactIDs: [],
      });
    }
  }

  for (const GOODArtifact of data.artifacts || []) {
    const artifact = convertGOODArtifact(GOODArtifact, idStore.gen());
    const owner = GOODArtifact.location ? findGOODCharacter(GOODArtifact.location) : undefined;

    if (!artifact) {
      continue;
    }

    result.artifacts.push({
      ...artifact,
      owner: owner?.name,
    });

    if (owner) {
      const character = Array_.findByName(result.characters, owner.name);

      if (character) {
        character.artifactIDs.push(artifact.ID);
      }
    }
  }

  for (const GOODWeapon of data.weapons || []) {
    const weapon = convertGOODWeapon(GOODWeapon, idStore.gen());
    const owner = GOODWeapon.location ? findGOODCharacter(GOODWeapon.location) : undefined;

    if (!weapon) {
      continue;
    }

    result.weapons.push({
      ...weapon,
      owner: owner?.name,
    });

    if (owner) {
      const character = Array_.findByName(result.characters, owner.name);

      if (character) {
        character.weaponID = weapon.ID;
      }
    }
  }

  for (const character of result.characters) {
    if (!character.weaponID) {
      const { weaponType } = $AppCharacter.get(character.name);
      const newWeapon = createWeaponBasic({ type: weaponType, owner: character.name }, idStore);

      result.weapons.push(newWeapon);
      character.weaponID = newWeapon.ID;
    }
  }

  return result;
}
