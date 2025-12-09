import { IDbArtifact, UserCharacter, UserComplexSetup, UserSetup, IDbWeapon } from "@/types";

export interface UploadedData {
  characters: UserCharacter[];
  weapons: IDbWeapon[];
  artifacts: IDbArtifact[];
  setups: (UserSetup | UserComplexSetup)[];
}

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";
