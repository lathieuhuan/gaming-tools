import type { GOODCharacterConvertReturn } from "@/logic/converGOOD.logic";
import type { ArtifactGear, Weapon } from "@/models";
import type { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD";

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
  weapon: Weapon;
  atfGear: ArtifactGear;
};

export type GenshinUser = Omit<GenshinUserResponse, "builds"> & {
  builds: GenshinUserBuild[];
};
