import type { CalcCharacter } from "@/models/base";
import type { ArtifactSubStat, IArtifact, ICharacterBasic } from "@/types";

export type CloneOptions = {
  ID?: number;
};

export type MainUpdateData = Partial<
  Pick<CalcCharacter, keyof ICharacterBasic | "weapon" | "atfGear" | "attkBonusCtrl" | "totalAttrs">
>;

export type ArtifactPieceUpdateData = Partial<Pick<IArtifact, "level" | "mainStatType">> & {
  subStat?: Partial<ArtifactSubStat> & {
    index: number;
  };
};
