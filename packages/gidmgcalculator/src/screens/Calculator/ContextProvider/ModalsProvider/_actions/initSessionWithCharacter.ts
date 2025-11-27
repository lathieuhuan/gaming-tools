import type { TavernSelectedCharacter } from "@/components";
import type { UserdbState } from "@Store/userdb-slice";

import { Artifact } from "@/models/base";
import { ArtifactGear } from "@/models/base";
import { $AppArtifact, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";
import { initSession } from "@Store/calculator/actions";
import {
  CalcSetup,
  MainArtifactGear,
  MainCharacter,
  MainTarget,
  MainWeapon,
  type MainCharacterConstructInfo,
} from "@/models/calculator";

export function initSessionWithCharacter(
  selectedCharacter: TavernSelectedCharacter,
  userDb: UserdbState
) {
  const { userData, data } = selectedCharacter;
  const { artifactIDs = [] } = userData ?? {};

  const { userWps, userArts } = userDb;
  let seedID = Date.now();

  const characterInfo: MainCharacterConstructInfo = {
    name: data.name,
  };

  // ===== Weapon =====
  const existedWeapon = Array_.findById(userWps, userData?.weaponID);

  const weapon = existedWeapon
    ? new MainWeapon(existedWeapon, $AppWeapon.get(existedWeapon.code)!)
    : MainWeapon.DEFAULT(data.weaponType, seedID++);

  characterInfo.weapon = weapon;

  // ===== Artifacts =====
  const artifacts: Artifact[] = [];

  for (const artifactID of artifactIDs) {
    const existedartifact = Array_.findById(userArts, artifactID);

    if (existedartifact) {
      const data = $AppArtifact.getSet(existedartifact.code)!;
      artifacts.push(new Artifact(existedartifact, data));
    }
  }

  characterInfo.artifact = new MainArtifactGear(artifacts);

  // ===== Character =====
  const character = new MainCharacter(
    {
      ...userData,
      ...characterInfo,
    },
    data
  );

  initSession({
    calcSetup: new CalcSetup({
      ID: seedID++,
      char: character,
      target: new MainTarget(),
    }),
  });
}
