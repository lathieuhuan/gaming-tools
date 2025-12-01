import type { CalcSetupConstructParams } from "@/models/calculator";

export type SetupType = "original" | "combined" | "complex";

export type SetupImportInfo = {
  ID?: number;
  name?: string;
  type?: "original" | "combined";
  source?: "URL" | "SETUP_MANAGER" | "MY_SETUPS" | "ENKA";
  params?: CalcSetupConstructParams;
};

// TODO: Remove
// export type AppCharactersByName = Record<string, AppCharacter>;

// export type AppArtifactsByCode = Record<string, AppArtifact>;

// export type AppWeaponsByCode = Record<string, AppWeapon>;

// export type SetupAppEntities = {
//   appCharacters: AppCharactersByName;
//   appWeapons: AppWeaponsByCode;
//   appArtifacts: AppArtifactsByCode;
//   appTeammates: CalcAppTeammates;
//   appTeamBuffs: AppTeamBuff[];
// };
