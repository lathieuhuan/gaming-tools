import type {
  IArtifactBasic,
  IDbCharacter,
  IDbComplexSetup,
  IDbSetup,
  IWeaponBasic,
} from "@/types";

export type CurrentDatabaseData = {
  version: number;
  characters: IDbCharacter[];
  weapons: IWeaponBasic[];
  artifacts: IArtifactBasic[];
  setups: (IDbSetup | IDbComplexSetup)[];
};
