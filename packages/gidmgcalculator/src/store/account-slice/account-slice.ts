import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { TravelerInfo } from "@/types";
import type { AccountState } from "./types";

import { $AppCharacter } from "@/services";

const initialState: AccountState = {
  traveler: $AppCharacter.DEFAULT_TRAVELER,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    updateTraveler: (state, action: PayloadAction<Partial<TravelerInfo>>) => {
      state.traveler = {
        ...state.traveler,
        ...action.payload,
      };
      $AppCharacter.changeTraveler(state.traveler);
    },
  },
});

export const { updateTraveler } = accountSlice.actions;

export default accountSlice.reducer;
