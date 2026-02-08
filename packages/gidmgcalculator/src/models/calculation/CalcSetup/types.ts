import type { ArtifactSubStat, IArtifact, ICharacterBasic } from "@/types";
import type { CharacterCalc } from "../CharacterCalc";

export type CloneOptions = {
  ID?: number;
};

export type MainUpdateData = Partial<
  Pick<CharacterCalc, keyof ICharacterBasic | "weapon" | "atfGear" | "attkBonusCtrl" | "allAttrs">
>;

export type ArtifactPieceUpdateData = Partial<Pick<IArtifact, "level" | "mainStatType">> & {
  subStat?: Partial<ArtifactSubStat> & {
    index: number;
  };
};
