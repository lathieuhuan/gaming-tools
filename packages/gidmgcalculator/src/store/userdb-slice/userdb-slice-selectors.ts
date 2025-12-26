import type { RootState } from "../store";

export const selectDbWeapons = (state: RootState) => state.userdb.userWps;
export const selectDbArtifacts = (state: RootState) => state.userdb.userArts;
export const selectDbCharacters = (state: RootState) => state.userdb.userChars;
export const selectUserSetups = (state: RootState) => state.userdb.userSetups;
export const selectChosenCharacter = (state: RootState) => state.userdb.chosenChar;
export const selectChosenSetupId = (state: RootState) => state.userdb.chosenSetupID;
