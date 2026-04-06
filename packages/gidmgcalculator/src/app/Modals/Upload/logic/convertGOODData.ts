import { Array_ } from "ron-utils";

import type { CurrentDatabaseData } from "@/migration/types/current";
import type { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD";

import { DOWNLOAD_DATA_VERSION } from "@/constants/config";
import {
  convertGOODArtifact,
  convertGOODCharacter,
  convertGOODWeapon,
  findGOODCharacter,
} from "@/logic/converGOOD.logic";
import { createWeapon } from "@/logic/entity.logic";
import { $AppCharacter } from "@/services";
import IdStore from "@/utils/IdStore";

type GOODData = {
  characters?: GOODCharacter[];
  weapons?: GOODWeapon[];
  artifacts?: GOODArtifact[];
};

export function convertGOODData(data: GOODData) {
  const result: CurrentDatabaseData = {
    version: DOWNLOAD_DATA_VERSION,
    characters: [],
    weapons: [],
    artifacts: [],
    setups: [],
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

    artifact.relation.set("owner", owner?.code);
    result.artifacts.push(artifact.serialize());

    if (owner) {
      const character = Array_.findByCode(result.characters, owner.code);

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

    weapon.relation.set("owner", owner?.code);
    result.weapons.push(weapon.serialize());

    if (owner) {
      const character = Array_.findByCode(result.characters, owner.code);

      if (character) {
        character.weaponID = weapon.ID;
      }
    }
  }

  for (const character of result.characters) {
    if (!character.weaponID) {
      const { weaponType } = $AppCharacter.get(character.code);
      const newWeapon = createWeapon({
        ID: idStore.gen(),
        type: weaponType,
        owner: character.code,
      });

      result.weapons.push(newWeapon);
      character.weaponID = newWeapon.ID;
    }
  }

  return result;
}
