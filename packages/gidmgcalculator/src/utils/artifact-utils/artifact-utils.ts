import type { Artifact, ArtifactType } from "@Src/types";
import { $AppSettings } from "@Src/services";
import { ARTIFACT_MAIN_STATS } from "./artifact-stats";

type CreateArtifactArgs = Pick<Artifact, "type" | "code" | "rarity">;

class ArtifactUtils {
  static createArtifact({ type, code, rarity }: CreateArtifactArgs, ID = Date.now()): Artifact {
    const { artLevel } = $AppSettings.get();

    return {
      ID,
      type,
      code,
      rarity,
      level: Math.min(artLevel, rarity === 5 ? 20 : 16),
      mainStatType: type === "flower" ? "hp" : type === "plume" ? "atk" : "atk_",
      subStats: [
        { type: "def", value: 0 },
        { type: "def_", value: 0 },
        { type: "cRate_", value: 0 },
        { type: "cDmg_", value: 0 },
      ],
    };
  }

  static getPossibleMainStatTypes(artifactType: ArtifactType): string[] {
    return Object.keys(ARTIFACT_MAIN_STATS[artifactType]);
  }

  static getMainStatValue(artifact: Artifact): number {
    const { type, level, rarity = 5, mainStatType } = artifact;
    return ARTIFACT_MAIN_STATS[type][mainStatType]?.[rarity][level] || 0;
  }
}

export default ArtifactUtils;
