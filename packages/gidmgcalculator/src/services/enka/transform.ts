import type { IArtifact } from "@/types";
import type { GenshinUser, GenshinUserBuild, GenshinUserResponse } from "./types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { createArtifact, createWeapon } from "@/utils/entity-utils";
import { convertGOODArtifact, convertGOODCharacter, convertGOODWeapon } from "@/utils/GOOD";
import IdStore from "@/utils/IdStore";

export function transformResponse(response: GenshinUserResponse): GenshinUser {
  const builds: GenshinUserBuild[] = [];
  const idStore = new IdStore();

  for (const build of response.builds) {
    const character = convertGOODCharacter(build.character);

    if (!character) {
      continue;
    }

    const convertedWeapon = convertGOODWeapon(build.weapon, idStore.gen());

    const weapon = convertedWeapon
      ? createWeapon(convertedWeapon, convertedWeapon.data, idStore)
      : createWeapon({ type: character.data.weaponType }, undefined, idStore);

    const artifacts = ARTIFACT_TYPES.map<IArtifact | null>((type) => {
      const GOODArtifact = build.artifacts.find((artifact) => artifact?.slotKey === type);

      if (!GOODArtifact) {
        return null;
      }

      const converted = convertGOODArtifact(GOODArtifact, idStore.gen());

      return converted ? createArtifact(converted, converted.data, idStore) : null;
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
