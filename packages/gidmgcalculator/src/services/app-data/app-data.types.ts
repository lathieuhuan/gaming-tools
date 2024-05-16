import type { AppArtifact, AppCharacter, AppMonster, AppWeapon } from "@Backend";

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

export type Metadata = {
  version: string;
  characters: AppCharacter[];
  weapons: AppWeapon[];
  artifacts: AppArtifact[];
  monsters: AppMonster[];
  updates: Update[];
  supporters: string[];
};
