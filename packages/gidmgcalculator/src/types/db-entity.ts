import type { BasicSetupType } from "./calculator";
import type { IArtifactBasic, ICharacterBasic, ISetupBasic, IWeaponBasic } from "./entity";

export type IDbItem = IWeaponBasic | IArtifactBasic;

export type IDbCharacter = ICharacterBasic & {
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
