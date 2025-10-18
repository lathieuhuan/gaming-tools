import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import { ConvertedArtifact } from "@/services/app-data";
import Entity_ from "@/utils/Entity";
import { ARTIFACT_TYPES } from "@Calculation";
import { GenshinUser, GenshinUserBuild, GenshinUserResponse } from "./types";

export function transformResponse(response: GenshinUserResponse): GenshinUser {
  const builds: GenshinUserBuild[] = [];
  let seedId = Date.now();

  for (const build of response.builds) {
    const character = $AppCharacter.convertGOOD(build.character);

    if (character) {
      const id = seedId++;
      let weapon = $AppWeapon.convertGOOD(build.weapon, id);

      if (!weapon) {
        const defaultWeapon = Entity_.createWeapon({ type: character.data.weaponType }, id);

        weapon = {
          ...defaultWeapon,
          data: $AppWeapon.get(defaultWeapon.code)!,
        };
      }

      const artifacts = ARTIFACT_TYPES.map<ConvertedArtifact | null>((type) => {
        const artifact = build.artifacts.find((artifact) => artifact?.slotKey === type);
        const converted = artifact ? $AppArtifact.convertGOOD(artifact, seedId) : undefined;

        if (converted) {
          seedId++;
          return converted;
        }

        return null;
      });

      builds.push({
        character,
        weapon,
        artifacts,
      });
    }
  }

  return {
    name: response.name,
    level: response.level,
    signature: response.signature,
    builds: builds,
  };
}
