import { IArtifact, IWeapon } from "@/types";
import { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD";
import { GOODCharacterConvertReturn } from "@/utils/GOOD";

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
  character: GOODCharacterConvertReturn;
  weapon: IWeapon;
  artifacts: (IArtifact | null)[];
};

export type GenshinUser = Omit<GenshinUserResponse, "builds"> & {
  builds: GenshinUserBuild[];
};
