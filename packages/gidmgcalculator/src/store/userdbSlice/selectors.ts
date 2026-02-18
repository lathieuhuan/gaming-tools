import type { RootState } from "../store";

export const selectDbWeapons = (state: RootState) => state.userdb.userWps;
export const selectDbArtifacts = (state: RootState) => state.userdb.userArts;
export const selectDbCharacters = (state: RootState) => state.userdb.userChars;
export const selectDbSetups = (state: RootState) => state.userdb.userSetups;
export const selectActiveCharacter = (state: RootState) => state.userdb.chosenChar;
export const selectActiveSetupId = (state: RootState) => state.userdb.chosenSetupID;
