import { ConvertedArtifact, ConvertedCharacter, ConvertedWeapon } from "@/services/app-data";
import { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD.types";

type GOODBuild = {
  name?: string;
  character: GOODCharacter;
  weapon: GOODWeapon;
  artifacts: GOODArtifact[];
};

export type GenshinUserResponse = {
  uid: string;
  name: string;
  level: number;
  worldLevel: number;
  signature: string | null;
  builds: GOODBuild[];
  ttl?: number;
};

export type GenshinUserBuild = {
  name?: string;
  character: ConvertedCharacter;
  weapon: ConvertedWeapon;
  artifacts: (ConvertedArtifact | null)[];
};

export type GenshinUser = Omit<GenshinUserResponse, "builds"> & {
  builds: GenshinUserBuild[];
};
