import { Array_ } from "ron-utils";

import type { DbCharacter, RawArtifact, RawWeapon, WeaponType } from "@/types";

import { createArtifact, createCharacter, createWeapon } from "@/logic/entity.logic";
import { ArtifactGear } from "@/models";
import { getAppCharacter } from "@/services/app-data";
import { IdStore } from "@/utils/IdStore";

export function parseDbWeapon(
  weaponID: number,
  dbWeapons: RawWeapon[],
  weaponType: WeaponType,
  idStore?: IdStore,
) {
  const dbWeapon = Array_.findById(dbWeapons, weaponID);

  const weapon = dbWeapon
    ? createWeapon(dbWeapon)
    : createWeapon({ ID: idStore?.gen(), type: weaponType });

  return weapon;
}

export function parseDbArtifacts(artifactIDs: number[] = [], dbArtifacts: RawArtifact[]) {
  const artifacts = artifactIDs.map((artifactID) => {
    const userAtf = Array_.findById(dbArtifacts, artifactID);
    return userAtf ? createArtifact(userAtf) : undefined;
  });

  return ArtifactGear.create(artifacts);
}

export function makeCharacterCalcFromDb(
  character: DbCharacter,
  dbWeapons: RawWeapon[],
  dbArtifacts: RawArtifact[],
  data = getAppCharacter(character.code),
) {
  const { weaponID, artifactIDs } = character;
  const weapon = parseDbWeapon(weaponID, dbWeapons, data.weaponType);
  const atfGear = parseDbArtifacts(artifactIDs, dbArtifacts);

  return createCharacter(character, data, {
    weapon,
    atfGear,
  });
}
