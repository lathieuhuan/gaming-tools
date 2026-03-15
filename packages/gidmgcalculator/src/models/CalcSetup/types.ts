import type { ArtifactSubStat, IArtifact, ICharacterBasic } from "@/types";

export type CloneOptions = {
  ID?: number;
};

export type MainUpdateData = Partial<ICharacterBasic>;

export type ArtifactPieceUpdateData = Partial<Pick<IArtifact, "level" | "mainStatType">> & {
  subStat?: Partial<ArtifactSubStat> & {
    index: number;
  };
};
