import type { ArtifactSubStat, IArtifact } from "@/types";

export type CloneOptions = {
  ID?: number;
};

export type ArtifactPieceUpdateData = Partial<Pick<IArtifact, "level" | "mainStatType">> & {
  subStat?: Partial<ArtifactSubStat> & {
    index: number;
  };
};
