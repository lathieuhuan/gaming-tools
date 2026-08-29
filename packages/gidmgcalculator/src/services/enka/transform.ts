import type { GenshinUser, GenshinUserBuild, GenshinUserResponse } from "./types";

import { ARTIFACT_TYPES } from "@/constants/global";
import {
  convertGOODArtifact,
  convertGOODCharacter,
  convertGOODWeapon,
} from "@/logic/converGOOD.logic";
import { createWeapon } from "@/logic/entity.logic";
import { Artifact, ArtifactGear } from "@/models";
import IdStore from "@/utils/IdStore";

export function transformGenshinUserResponse(
  response: GenshinUserResponse,
  idStore = new IdStore(),
): GenshinUser {
  const builds: GenshinUserBuild[] = [];

  for (const build of response.builds) {
    const character = convertGOODCharacter(build.character);

    if (!character) {
      continue;
    }

    const weapon =
      convertGOODWeapon(build.weapon, idStore.gen()) ||
      createWeapon({ ID: idStore.gen(), type: character.data.weaponType });

    weapon.owner = character.data.code;

    const artifacts = ARTIFACT_TYPES.map<Artifact | undefined>((type) => {
      const GOODArtifact = build.artifacts.find((artifact) => artifact?.slotKey === type);

      if (!GOODArtifact) {
        return undefined;
      }

      return convertGOODArtifact(GOODArtifact, idStore.gen());
    });

    builds.push({
      character,
      weapon,
      atfGear: ArtifactGear.create(artifacts),
    });
  }

  return {
    ...response,
    builds,
  };
}
