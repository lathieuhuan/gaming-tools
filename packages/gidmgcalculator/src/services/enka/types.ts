import { ConvertedArtifact, ConvertedCharacter, ConvertedWeapon } from "@/services/app-data";
import { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD.types";

type GOODBuild = {
  name?: string;
  character: GOODCharacter;
  weapon: GOODWeapon;
  artifacts: GOODArtifact[];
};

export type GenshinUserResponse = {
  name: string;
  level: number;
  signature: string;
  builds: GOODBuild[];
};

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
