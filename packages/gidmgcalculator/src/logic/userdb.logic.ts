import { Array_ } from "ron-utils";

import type { IDbCharacter, RawArtifact, RawWeapon, WeaponType } from "@/types";

import { createArtifact, createCharacter, createWeapon } from "@/logic/entity.logic";
import { Artifact, ArtifactGear, Team } from "@/models";
import { $AppCharacter } from "@/services";
import IdStore from "@/utils/IdStore";

export function parseDbWeapon(
  weaponID: number,
  dbWeapons: RawWeapon[],
  weaponType: WeaponType,
  idStore?: IdStore
) {
  const dbWeapon = Array_.findById(dbWeapons, weaponID);

  const weapon = dbWeapon
    ? createWeapon(dbWeapon)
    : createWeapon({ ID: idStore?.gen(), type: weaponType });

  return weapon;
}

export function parseDbArtifacts(artifactIDs: number[] = [], dbArtifacts: RawArtifact[]) {
  const artifacts: Artifact[] = [];

  for (const artifactID of artifactIDs) {
    const dbArtifact = Array_.findById(dbArtifacts, artifactID);

    if (dbArtifact) {
      artifacts.push(createArtifact(dbArtifact));
    }
  }

  return new ArtifactGear(artifacts);
}

export function makeCharacterCalcFromDb(
  character: IDbCharacter,
  dbWeapons: RawWeapon[],
  dbArtifacts: RawArtifact[],
  data = $AppCharacter.get(character.code),
  team?: Team
) {
  const { weaponID, artifactIDs } = character;
  const weapon = parseDbWeapon(weaponID, dbWeapons, data.weaponType);
  const atfGear = parseDbArtifacts(artifactIDs, dbArtifacts);

  return createCharacter(character, data, {
    weapon,
    atfGear,
    team,
  });
}
