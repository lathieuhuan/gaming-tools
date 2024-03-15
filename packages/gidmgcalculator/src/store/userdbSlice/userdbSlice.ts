import { createSlice } from "@reduxjs/toolkit";
import type { UserArtifact, UserCharacter, UserComplexSetup, UserSetup, UserWeapon } from "@Src/types";

export type UserdbState = {
  userChars: UserCharacter[];
  userWps: UserWeapon[];
  userArts: UserArtifact[];
  userSetups: (UserSetup | UserComplexSetup)[];
  chosenChar: string;
  chosenSetupID: number;
};

export const initialState: UserdbState = {
  userChars: [],
  userWps: [],
  userArts: [],
  userSetups: [],
  chosenChar: "",
  chosenSetupID: 0,
};

export const userdbSlice = createSlice({
  name: "userdb",
  initialState,
  reducers: {
    //
  },
});

export const {} = userdbSlice.actions;

export default userdbSlice.reducer;
