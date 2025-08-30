import { UserArtifact, UserCharacter, UserComplexSetup, UserSetup, UserWeapon } from "@/types";

export interface UploadedData {
  characters: UserCharacter[];
  weapons: UserWeapon[];
  artifacts: UserArtifact[];
  setups: (UserSetup | UserComplexSetup)[];
}

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";
