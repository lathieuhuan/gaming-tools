import { Object_ } from "ron-utils";

import type { Artifact } from "@/models";
import type { GenshinUser, GenshinUserBuild, GenshinUserResponse } from "./types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { createArtifact, createWeapon } from "@/logic/entity.logic";
import {
  convertGOODArtifact,
  convertGOODCharacter,
  convertGOODWeapon,
} from "@/logic/converGOOD.logic";
import IdStore from "@/utils/IdStore";

export function transformGenshinUserResponse(
  response: GenshinUserResponse,
  idStore = new IdStore()
): GenshinUser {
  const builds: GenshinUserBuild[] = [];

  for (const build of response.builds) {
    const character = convertGOODCharacter(build.character);

    if (!character) {
      continue;
    }

    const convertedWeapon = convertGOODWeapon(build.weapon, idStore.gen());

    const weapon = convertedWeapon
      ? createWeapon(convertedWeapon, convertedWeapon.data)
      : createWeapon({ ID: idStore.gen(), type: character.data.weaponType });

    Object_.patch(weapon, { owner: character.data.code });

    const artifacts = ARTIFACT_TYPES.map<Artifact | null>((type) => {
      const GOODArtifact = build.artifacts.find((artifact) => artifact?.slotKey === type);

      if (!GOODArtifact) {
        return null;
      }

      const converted = convertGOODArtifact(GOODArtifact, idStore.gen());

      if (converted) {
        const artifact = createArtifact(converted);
        return Object_.patch(artifact, { owner: character.data.code });
      }

      return null;
    });

    builds.push({
      character,
      weapon,
      artifacts,
    });
  }

  return {
    ...response,
    builds,
  };
}
