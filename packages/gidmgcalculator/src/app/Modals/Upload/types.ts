import type { IDbArtifact, IDbCharacter, IDbComplexSetup, IDbSetup, IDbWeapon } from "@/types";

export interface UploadedData {
  characters: IDbCharacter[];
  weapons: IDbWeapon[];
  artifacts: IDbArtifact[];
  setups: (IDbSetup | IDbComplexSetup)[];
}

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";
