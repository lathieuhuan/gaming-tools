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
  uid: string | number;
  name: string;
  level: number;
  worldLevel: number;
  signature: string | null;
  builds: GOODBuild[];
  ttl?: number;
};

type GameAccount = {
  hash: string;
  player?: {
    name: string;
    level: number;
    worldLevel: number;
    signature?: string;
    uid?: number;
  };
};
export type EnkaUserResponse = {
  profile: string;
  gameAccounts: GameAccount[];
};

//

export type GenshinUserBuild = {
  name?: string;
  character: GOODCharacterConvertReturn;
  weapon: IWeapon;
  artifacts: (IArtifact | null)[];
};

export type GenshinUser = Omit<GenshinUserResponse, "builds"> & {
  builds: GenshinUserBuild[];
};
