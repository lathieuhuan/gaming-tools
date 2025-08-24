import { useEffect, useState } from "react";

import { ARTIFACT_TYPES } from "@Calculation";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import { ConvertedArtifact, ConvertedCharacter, ConvertedWeapon } from "@Src/services/app-data";
import { $Enka } from "@Src/services/enka";
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

export function useGenshinUser(uid?: string, options: { enable?: boolean } = {}) {
  const { enable = true } = options;

  const [user, setUser] = useState<GenshinUser>();
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const fetchUser = async (uid: string) => {
      const response = await $Enka.fetchGenshinUser(uid);
      // const response = userMock;
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

      setUser({
        name: response.name,
        level: response.level,
        builds: builds,
      });
    };

    if (uid && enable) {
      setStatus("loading");

      try {
        fetchUser(uid).then(() => {
          setStatus("success");
        });
      } catch (error) {
        setStatus("error");
      }
    }
  }, [uid, enable]);

  return {
    user,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    error: null,
  };
}
