import { UserArtifact, UserCharacter, UserSetup, UserWeapon } from "@Src/types";

export interface UploadedData {
  characters: UserCharacter[];
  weapons: UserWeapon[];
  artifacts: UserArtifact[];
  setups: UserSetup[];
}

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";
