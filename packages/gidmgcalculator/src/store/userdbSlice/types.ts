import type { PayloadAction } from "@reduxjs/toolkit";
import type { PartiallyOptional, PartiallyRequired, PartiallyRequiredOnly } from "rond";

import type {
  AppCharacter,
  ArtifactSubStat,
  RawArtifact,
  DbCharacter,
  DbComplexSetup,
  DbSetup,
  RawWeapon,
} from "@/types";

export type AddUserDatabaseAction = PayloadAction<{
  characters?: DbCharacter[];
  weapons?: RawWeapon[];
  artifacts?: RawArtifact[];
  setups?: (DbSetup | DbComplexSetup)[];
}>;

export type UpdateDbCharacterAction = PayloadAction<
  PartiallyRequired<Partial<DbCharacter>, "code">
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

export type SaveSetupAction = PayloadAction<DbSetup>;

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
  PartiallyRequiredOnly<DbCharacter, "code"> & {
    data?: AppCharacter;
  }
>;

export type DbItemSortPayload = {
  option: "time_added" | "level";
  direction: "asc" | "desc";
};
