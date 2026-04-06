import type {
  RawArtifact,
  IDbCharacter,
  IDbComplexSetup,
  IDbSetup,
  RawWeapon,
} from "@/types";

export type CurrentDatabaseData = {
  version: number;
  characters: IDbCharacter[];
  weapons: RawWeapon[];
  artifacts: RawArtifact[];
  setups: (IDbSetup | IDbComplexSetup)[];
};
