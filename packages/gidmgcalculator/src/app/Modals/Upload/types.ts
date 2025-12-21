import type { IArtifactBasic, IDbCharacter, IDbComplexSetup, IDbSetup, IWeaponBasic } from "@/types";

export interface UploadedData {
  characters: IDbCharacter[];
  weapons: IWeaponBasic[];
  artifacts: IArtifactBasic[];
  setups: (IDbSetup | IDbComplexSetup)[];
}

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";
