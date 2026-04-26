import type {
  RawArtifact,
  DbCharacter,
  DbComplexSetup,
  DbSetup,
  RawWeapon,
} from "@/types";

export type CurrentDatabaseData = {
  version: number;
  characters: DbCharacter[];
  weapons: RawWeapon[];
  artifacts: RawArtifact[];
  setups: (DbSetup | DbComplexSetup)[];
};
