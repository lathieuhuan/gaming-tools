import type { ArtifactType, AttributeStat } from "@Src/types";
import { $AppSettings } from "@Src/services";
import { ARTIFACT_MAIN_STATS } from "./artifact-stats";

type CreateArtifactArgs = Pick<Artifact, "type" | "code" | "rarity">;

export type ArtifactSubStat = {
  type: AttributeStat;
  value: number;
};

export class Artifact {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];

  constructor({ type, code, rarity }: CreateArtifactArgs, ID = Date.now()) {
    const { artLevel } = $AppSettings.get();

    this.ID = ID;
    this.type = type;
    this.code = code;
    this.rarity = rarity;
    this.level = Math.min(artLevel, rarity === 5 ? 20 : 16);
    this.mainStatType = type === "flower" ? "hp" : type === "plume" ? "atk" : "atk_";
    this.subStats = [
      { type: "def", value: 0 },
      { type: "def_", value: 0 },
      { type: "cRate_", value: 0 },
      { type: "cDmg_", value: 0 },
    ];
  }

  static getPossibleMainStats(artifactType: ArtifactType) {
    return ARTIFACT_MAIN_STATS[artifactType];
  }

  static getMainStatValue(artifact: Artifact) {
    const { type, level, rarity = 5, mainStatType } = artifact;
    return ARTIFACT_MAIN_STATS[type][mainStatType]?.[rarity][level] || 0;
  }
}
