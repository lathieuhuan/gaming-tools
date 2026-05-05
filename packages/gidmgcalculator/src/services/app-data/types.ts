import type {
  AppArtifact,
  AppCharacter,
  AppMonster,
  TeamBuffSpec,
  AppWeapon,
  CharacterInnateBuff,
} from "@/types";

export type AppUpdate = {
  patch: string;
  date: string;
  content: string[];
};

export type AllData = {
  version: string;
  characters: AppCharacter[];
  weapons: AppWeapon[];
  artifacts: AppArtifact[];
  teamBuffs: TeamBuffSpec[];
  monsters: AppMonster[];
  updates: AppUpdate[];
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
