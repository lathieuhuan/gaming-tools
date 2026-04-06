import type { PayloadAction } from "@reduxjs/toolkit";
import type { PartiallyOptional, PartiallyRequired, PartiallyRequiredOnly } from "rond";

import type {
  AppCharacter,
  ArtifactSubStat,
  RawArtifact,
  IDbCharacter,
  IDbComplexSetup,
  IDbSetup,
  RawWeapon,
} from "@/types";

export type AddUserDatabaseAction = PayloadAction<{
  characters?: IDbCharacter[];
  weapons?: RawWeapon[];
  artifacts?: RawArtifact[];
  setups?: (IDbSetup | IDbComplexSetup)[];
}>;

export type UpdateDbCharacterAction = PayloadAction<
  PartiallyRequired<Partial<IDbCharacter>, "code">
>;

export type UpdateDbArtifactSubStatAction = PayloadAction<
  { ID: number; subStatIndex: number } & Partial<ArtifactSubStat>
>;

export type RemoveDbArtifactAction = PayloadAction<{
  ID: number;
}>;

export type UpdateDbWeaponAction = PayloadAction<PartiallyRequired<Partial<RawWeapon>, "ID">>;

export type UpdateDbArtifactAction = PayloadAction<
  PartiallyRequired<Partial<RawArtifact>, "ID">
>;

export type RemoveDbWeaponAction = PayloadAction<{
  ID: number;
}>;

type SwitchPayload = {
  targetId: number;
  targetOwner: number | undefined;
  currentId: number;
  currentOwner: number;
};

export type SwitchWeaponAction = PayloadAction<SwitchPayload>;

export type SwitchArtifactAction = PayloadAction<PartiallyOptional<SwitchPayload, "currentId">>;

export type SaveSetupAction = PayloadAction<IDbSetup>;

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

export type AddDbCharacterAction = PayloadAction<
  PartiallyRequiredOnly<IDbCharacter, "code"> & {
    data?: AppCharacter;
  }
>;

export type DbItemSortPayload = {
  option: "time_added" | "level";
  direction: "asc" | "desc";
};
