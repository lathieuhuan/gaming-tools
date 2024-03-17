import type { Artifact, ArtifactType } from "@Src/types";
import { $AppSettings } from "@Src/services";
import { ARTIFACT_MAIN_STATS } from "./artifact-stats";

type CreateArtifactArgs = Pick<Artifact, "type" | "code" | "rarity">;

export class Artifact_ {
  static readonly ARTIFACT_TYPE_ICONS: Array<{ value: ArtifactType; icon: string }> = [
    { value: "flower", icon: "2/2d/Icon_Flower_of_Life" },
    { value: "plume", icon: "8/8b/Icon_Plume_of_Death" },
    { value: "sands", icon: "9/9f/Icon_Sands_of_Eon" },
    { value: "goblet", icon: "3/37/Icon_Goblet_of_Eonothem" },
    { value: "circlet", icon: "6/64/Icon_Circlet_of_Logos" },
  ];

  static create({ type, code, rarity }: CreateArtifactArgs, ID = Date.now()): Artifact {
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

  static possibleMainStatTypesOf(artifactType: ArtifactType): string[] {
    return Object.keys(ARTIFACT_MAIN_STATS[artifactType]);
  }

  static mainStatValueOf(artifact: Artifact): number {
    const { type, level, rarity = 5, mainStatType } = artifact;
    return ARTIFACT_MAIN_STATS[type][mainStatType]?.[rarity][level] || 0;
  }

  static iconOf(artifactType: ArtifactType) {
    return this.ARTIFACT_TYPE_ICONS.find((item) => item.value === artifactType)?.icon;
  }
}
