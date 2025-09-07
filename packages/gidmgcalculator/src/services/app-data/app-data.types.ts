import type { AppArtifact, AppCharacter, AppMonster, AppWeapon, CharacterInnateBuff } from "@Calculation";

export type DataControl<T> = {
  status: "unfetched" | "fetching" | "fetched";
  data: T;
};

export type ServiceSubscriber<T> = (data: T) => void;

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
  monsters: AppMonster[];
  updates: Update[];
  supporters: string[];
};

export type TravelerProps = {
  name: string;
  icon: string;
  sideIcon: string;
  multFactorsCA: number[];
  innateBuffs: CharacterInnateBuff[];
};
