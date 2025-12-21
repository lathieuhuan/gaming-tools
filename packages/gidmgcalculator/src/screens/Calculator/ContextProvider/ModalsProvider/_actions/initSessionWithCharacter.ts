import type { TavernSelectedCharacter } from "@/components";
import type { UserdbState } from "@Store/userdb-slice";

import { ArtifactGear, CalcCharacter } from "@/models/base";
import { CalcSetup } from "@/models/calculator";
import {
  createArtifact,
  createCharacterBasic,
  createWeapon,
  createWeaponBasic,
} from "@/utils/entity-utils";
import IdStore from "@/utils/IdStore";
import { parseDbArtifacts, parseDbWeapon } from "@/utils/userdb";
import { initSession } from "@Store/calculator/actions";

export function initSessionWithCharacter(
  selectedCharacter: TavernSelectedCharacter,
  userDb: UserdbState
) {
  const { userData, data } = selectedCharacter;
  const { weaponID, artifactIDs } = userData ?? {};
  const { userWps, userArts } = userDb;

  const weaponBasic = weaponID
    ? parseDbWeapon(weaponID, userWps, data.weaponType)
    : createWeaponBasic({ type: data.weaponType });

  // weaponBasic.ID !== weaponID => weaponBasic is new => use weaponBasic.ID as seed
  const idStore = new IdStore(weaponBasic.ID !== weaponID ? weaponBasic.ID : undefined);

  const artifacts = parseDbArtifacts(artifactIDs, userArts).map((artifactBasic) =>
    createArtifact(artifactBasic, undefined, idStore)
  );

  const weapon = createWeapon(weaponBasic);
  const atfGear = new ArtifactGear(artifacts);

  const characterBasic = createCharacterBasic({
    ...userData,
    name: data.name,
  });

  const main = new CalcCharacter(
    {
      ...characterBasic,
      weapon,
      atfGear,
    },
    data
  );

  initSession({
    calcSetup: new CalcSetup({
      ID: idStore.gen(),
      main,
    }),
  });
}
