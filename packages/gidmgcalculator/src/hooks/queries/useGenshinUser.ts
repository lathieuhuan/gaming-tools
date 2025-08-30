import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import { ARTIFACT_TYPES } from "@Calculation";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import { ConvertedArtifact, ConvertedCharacter, ConvertedWeapon } from "@Src/services/app-data";
import { GenshinUserResponse, getGenshinUser } from "@Src/services/enka";
import Entity_ from "@Src/utils/entity-utils";
// import { userMock } from "./mock";

export type GenshinUserBuild = {
  name?: string;
  character: ConvertedCharacter;
  weapon: ConvertedWeapon;
  artifacts: (ConvertedArtifact | null)[];
};

export type GenshinUser = {
  name: string;
  level: number;
  builds: GenshinUserBuild[];
};

type UseGenshinUserOptions = Omit<UndefinedInitialDataOptions<GenshinUserResponse>, "queryKey" | "queryFn">;

export function useGenshinUser(uid: string = "", options: UseGenshinUserOptions) {
  return useQuery({
    ...options,
    queryKey: ["genshin-user", uid],
    queryFn: () => getGenshinUser(uid),
    enabled: !!uid && options.enabled,
    select: (data) => transformResponse(data),
  });
}

function transformResponse(response: GenshinUserResponse): GenshinUser {
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
    builds: builds,
  };
}
