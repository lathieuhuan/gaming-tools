import type {
  AppArtifact,
  AppCharacter,
  AppMonster,
  AppTeamBuff,
  AppWeapon,
  CharacterInnateBuff,
} from "@/types";

export type Update = {
  date: string;
  content: string[];
  patch?: string;
};

export type AllData = {
  version: string;
  characters: AppCharacter[];
  weapons: AppWeapon[];
  artifacts: AppArtifact[];
  teamBuffs: AppTeamBuff[];
  monsters: AppMonster[];
  updates: Update[];
  supporters: string[];
};

export type TravelerProps = {
  name: string;
  icon: string;
  sideIcon: string;
  factorsCA: number[];
  innateBuffs: CharacterInnateBuff[];
};

type Item = {
  description: string;
};

export type GenshinDevCharacterSuccessResponse = {
  name: string;
  skillTalents: Item[];
  passiveTalents: Item[];
  constellation: Item[];
};

export type GenshinDevErrorResponse = {
  error: string;
};
