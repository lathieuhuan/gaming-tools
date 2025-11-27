import { IUserArtifact, UserCharacter, UserComplexSetup, UserSetup, IUserWeapon } from "@/types";

export interface UploadedData {
  characters: UserCharacter[];
  weapons: IUserWeapon[];
  artifacts: IUserArtifact[];
  setups: (UserSetup | UserComplexSetup)[];
}

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";
