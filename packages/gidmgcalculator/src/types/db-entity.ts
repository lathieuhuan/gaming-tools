import type { BasicSetupType } from "./calculator";
import type { RawCharacter, ISetupBasic } from "./entity";

export type IDbCharacter = RawCharacter & {
  weaponID: number;
  artifactIDs: number[];
};

export type IDbSetup = Omit<ISetupBasic, "main"> & {
  ID: number;
  type: BasicSetupType;
  name: string;

  main: IDbCharacter;
};

export type IDbComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};
