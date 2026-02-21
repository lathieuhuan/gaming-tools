import type { TavernSelectedCharacter } from "@/components";
import type { UserdbState } from "@Store/userdbSlice";

import {
  createArtifact,
  createCharacterCalc,
  createWeapon,
  createWeaponBasic,
} from "@/logic/entity.logic";
import { parseDbArtifacts, parseDbWeapon } from "@/logic/userdb.logic";
import { ArtifactGear, CalcSetup } from "@/models";
import IdStore from "@/utils/IdStore";
import { initSession } from "@Store/calculator/actions";
import { isTourFinished } from "@Store/tours";
import { updateUI } from "@Store/ui";

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

  const main = createCharacterCalc(
    {
      ...userData,
      code: data.code,
      weapon,
      atfGear,
    },
    data
  );

  const calcSetup = new CalcSetup({
    ID: idStore.gen(),
    main,
  });

  initSession({
    calcSetup,
  });

  if (!isTourFinished("CHAR_ENHANCE") && main.data.enhanceType) {
    updateUI({ appModalType: "CHAR_ENHANCE_NOTICE" });
  }
}
