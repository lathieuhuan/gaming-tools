import type { PayloadAction } from "@reduxjs/toolkit";
import type { PartiallyRequired, PartiallyRequiredOnly } from "rond";

import type {
  AppCharacter,
  ArtifactSubStat,
  IArtifactBasic,
  IDbCharacter,
  IDbComplexSetup,
  IDbSetup,
  IWeaponBasic,
} from "@/types";

export type AddUserDatabaseAction = PayloadAction<{
  characters?: IDbCharacter[];
  weapons?: IWeaponBasic[];
  artifacts?: IArtifactBasic[];
  setups?: (IDbSetup | IDbComplexSetup)[];
}>;

export type UpdateDbCharacterAction = PayloadAction<
  PartiallyRequired<Partial<IDbCharacter>, "name">
>;

export type UpdateDbArtifactSubStatAction = PayloadAction<
  { ID: number; subStatIndex: number } & Partial<ArtifactSubStat>
>;

export type RemoveDbArtifactAction = PayloadAction<{
  ID: number;
}>;

export type UpdateDbWeaponAction = PayloadAction<PartiallyRequired<Partial<IWeaponBasic>, "ID">>;

export type UpdateDbArtifactAction = PayloadAction<PartiallyRequired<Partial<IArtifactBasic>, "ID">>;

export type RemoveDbWeaponAction = PayloadAction<{
  ID: number;
}>;

type SwitchPayload = {
  /**
   * Owner of the target item
   */
  newOwner: string | undefined;
  newID: number;
  oldOwner: string;
  oldID: number;
};

export type SwitchWeaponAction = PayloadAction<SwitchPayload>;

export type SwitchArtifactAction = PayloadAction<SwitchPayload>;

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
  PartiallyRequiredOnly<IDbCharacter, "name"> & {
    data?: AppCharacter;
  }
>;
