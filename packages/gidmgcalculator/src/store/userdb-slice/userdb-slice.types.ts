import type { PayloadAction } from "@reduxjs/toolkit";
import type { PartiallyRequired, PartiallyRequiredOnly } from "rond";
import type { WeaponType, ArtifactType } from "@Calculation";
import type {
  ArtifactSubStat,
  UserArtifact,
  UserCharacter,
  UserComplexSetup,
  UserSetup,
  UserSetupCalcInfo,
  UserWeapon,
} from "@Src/types";

export type AddUserDatabaseAction = PayloadAction<{
  characters?: UserCharacter[];
  weapons?: UserWeapon[];
  artifacts?: UserArtifact[];
  setups?: (UserSetup | UserComplexSetup)[];
}>;

export type UpdateUserCharacterAction = PayloadAction<PartiallyRequired<Partial<UserCharacter>, "name">>;

export type UpdateUserArtifactSubStatAction = PayloadAction<
  { ID: number; subStatIndex: number } & Partial<ArtifactSubStat>
>;

export type RemoveArtifactAction = PayloadAction<{
  ID: number;
  owner: string | null;
  type: ArtifactType;
}>;

export type UpdateUserWeaponAction = PayloadAction<PartiallyRequired<Partial<UserWeapon>, "ID">>;

export type UpdateUserArtifactAction = PayloadAction<PartiallyRequired<Partial<UserArtifact>, "ID">>;

export type RemoveWeaponAction = PayloadAction<{
  ID: number;
  owner: string | null;
  type: WeaponType;
}>;

export type UnequipArtifactAction = PayloadAction<{
  owner: string | null;
  artifactID: number;
  artifactIndex: number;
}>;

type SwitchArgs = {
  /**
   * Owner of the target item
   */
  newOwner: string | null;
  newID: number;
  oldOwner: string;
  oldID: number;
};

export type SwitchWeaponAction = PayloadAction<SwitchArgs>;

export type SwitchArtifactAction = PayloadAction<
  SwitchArgs & {
    artifactIndex: number;
  }
>;

export type SaveSetupAction = PayloadAction<{
  ID: number;
  name: string;
  data: UserSetupCalcInfo;
}>;

export type CombineSetupsAction = PayloadAction<{
  name: string;
  pickedIDs: number[];
}>;

export type SwitchShownSetupInComplexAction = PayloadAction<{
  complexID: number;
  shownID: number;
}>;

export type AddSetupToComplexAction = PayloadAction<{
  complexID: number;
  pickedIDs: number[];
}>;

export type AddCharacterAction = PayloadAction<PartiallyRequiredOnly<UserCharacter, "name">>;
