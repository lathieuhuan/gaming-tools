import { AppArtifact, ArtifactType, AttributeStat } from "@/calculation/types";
import { ArtifactSubStat } from "@/types";

export interface IArtifact {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
}

export class ArtifactC implements IArtifact {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
  data: AppArtifact;

  constructor(artifact: IArtifact, data: AppArtifact) {
    this.ID = artifact.ID;
    this.code = artifact.code;
    this.type = artifact.type;
    this.rarity = artifact.rarity;
    this.level = artifact.level;
    this.mainStatType = artifact.mainStatType;
    this.subStats = artifact.subStats;
    this.data = data;
  }
}
