import type { IArtifactBasic, IDbCharacter, IWeaponBasic, WeaponType } from "@/types";

import { ArtifactGear, CalcCharacter, Team } from "@/models/base";
import { $AppCharacter } from "@/services";
import Array_ from "./Array";
import { createArtifact, createArtifactBasic, createWeapon, createWeaponBasic } from "./entity-utils";
import IdStore from "./IdStore";

export function parseDbWeapon(weaponID: number, dbWeapons: IWeaponBasic[], weaponType: WeaponType) {
  const dbWeapon = Array_.findById(dbWeapons, weaponID);

  const weapon = dbWeapon
    ? createWeaponBasic(dbWeapon)
    : createWeaponBasic({ ID: Date.now(), type: weaponType });

  return weapon;
}

export function parseDbArtifacts(artifactIDs: number[] = [], dbArtifacts: IArtifactBasic[]) {
  const artifacts: IArtifactBasic[] = [];

  for (const artifactID of artifactIDs) {
    const dbArtifact = Array_.findById(dbArtifacts, artifactID);

    if (dbArtifact) {
      artifacts.push(createArtifactBasic(dbArtifact));
    }
  }

  return artifacts;
}

export function makeCalcCharacterFromDb(
  character: IDbCharacter,
  dbWeapons: IWeaponBasic[],
  dbArtifacts: IArtifactBasic[],
  data = $AppCharacter.get(character.name)!,
  team?: Team
) {
  const { weaponID, artifactIDs } = character;
  const weaponBasic = weaponID
    ? parseDbWeapon(weaponID, dbWeapons, data.weaponType)
    : createWeaponBasic({ type: data.weaponType });

  // weaponBasic.ID !== weaponID => weaponBasic is new => use weaponBasic.ID as seed
  const idStore = new IdStore(weaponBasic.ID !== weaponID ? weaponBasic.ID : undefined);

  const artifacts = parseDbArtifacts(artifactIDs, dbArtifacts).map((artifactBasic) =>
    createArtifact(artifactBasic, undefined, idStore)
  );

  const weapon = createWeapon(weaponBasic);
  const atfGear = new ArtifactGear(artifacts);

  return new CalcCharacter(
    {
      ...character,
      weapon,
      atfGear,
    },
    data,
    team
  );
}
