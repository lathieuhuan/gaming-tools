import type { AppArtifact, AppCharacter, AppMonster, AppWeapon, TeamBuffSpec } from "@/types";

export type AppUpdate = {
  patch: string;
  date: string;
  content: string[];
};

export type AppData = {
  version: string;
  characters: AppCharacter[];
  weapons: AppWeapon[];
  artifacts: AppArtifact[];
  teamBuffs: TeamBuffSpec[];
  monsters: AppMonster[];
  updates: AppUpdate[];
  supporters: string[];
};
