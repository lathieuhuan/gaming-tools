import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { TravelerInfo, TravelerKey } from "@/types";
import type { AccountState } from "./types";

import { DEFAULT_TRAVELER } from "@/constants";
import { $AppCharacter } from "@/services";

// TODO: remove this after 01/11/2025
const savedSettings: { traveler?: TravelerKey } = JSON.parse(localStorage.getItem("settings") || "{}");

const initialState: AccountState = {
  traveler: {
    ...DEFAULT_TRAVELER,
    selection: savedSettings?.traveler || DEFAULT_TRAVELER.selection,
  },
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
