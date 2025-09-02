import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AccountState } from "./types";

const initialState: AccountState = {
  ingame: {
    traveler: "LUMINE",
    powerups: {
      cannedKnowledge: false,
      skirksTraining: false,
    },
  },
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    updateAccount: (state, action: PayloadAction<Partial<AccountState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateAccount } = accountSlice.actions;

export default accountSlice.reducer;
