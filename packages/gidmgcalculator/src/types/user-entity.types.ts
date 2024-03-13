import type { Character } from "./global.types";
import type { CalcArtifact, CalcSetup, CalcWeapon, SetupType, Target } from "./calculator.types";

export type UserDatabaseState = {
  userChars: UserCharacter[];
  userWps: UserWeapon[];
  userArts: UserArtifact[];
  userSetups: (UserSetup | UserComplexSetup)[];
  chosenChar: string;
  chosenSetupID: number;
};

export type UserCharacter = Character & {
  weaponID: number;
  artifactIDs: (number | null)[];
};

export type UserWeapon = CalcWeapon & {
  owner: string | null;
  setupIDs?: number[];
};

export type UserArtifact = CalcArtifact & {
  owner: string | null;
  setupIDs?: number[];
};

export type UserItem = UserWeapon | UserArtifact;

export type UserArtifacts = (UserArtifact | null)[];

export type UserSetupCalcInfo = Omit<CalcSetup, "weapon" | "artifacts"> & {
  weaponID: number;
  artifactIDs: (number | null)[];
  target: Target;
};

export type UserSetup = UserSetupCalcInfo & {
  ID: number;
  type: Exclude<SetupType, "complex">;
  name: string;
};

export type UserComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};
