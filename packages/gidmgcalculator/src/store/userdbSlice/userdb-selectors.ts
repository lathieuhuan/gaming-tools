import type { RootState } from "../store";

export const selectUserWeapons = (state: RootState) => state.userdb.userWps;

export const selectUserArtifacts = (state: RootState) => state.userdb.userArts;

export const selectUserCharacters = (state: RootState) => state.userdb.userChars;

export const selectUserSetups = (state: RootState) => state.userdb.userSetups;

export const selectChosenCharacter = (state: RootState) => state.userdb.chosenChar;

export const selectChosenSetupId = (state: RootState) => state.userdb.chosenSetupID;
