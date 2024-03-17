import type { SetupImportInfo, TrackerState } from "@Src/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type MySetupsModalType =
  | "TIPS"
  | "FIRST_COMBINE"
  | "COMBINE_MORE"
  | "SHARE_SETUP"
  | "REMOVE_SETUP"
  | "STATS"
  | "MODIFIERS"
  | "WEAPON"
  | "ARTIFACTS"
  | "";

export type AppScreen = "CALCULATOR" | "MY_SETUPS" | "MY_WEAPONS" | "MY_ARTIFACTS" | "MY_CHARACTERS";

export interface UIState {
  ready: boolean;
  loading: boolean;
  atScreen: AppScreen;
  appModalType: "" | "INTRO" | "GUIDES" | "SETTINGS" | "UPLOAD" | "DOWNLOAD" | "DONATE";
  highManagerActive: boolean;
  trackerState: TrackerState;
  mySetupsModalType: MySetupsModalType;
  importInfo: SetupImportInfo;
}

const initialState: UIState = {
  atScreen: "CALCULATOR",
  appModalType: "INTRO",
  mySetupsModalType: "",
  highManagerActive: false,
  trackerState: "close",
  importInfo: {},
  loading: false,
  ready: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    updateUI: (state, action: PayloadAction<Partial<UIState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateSetupImportInfo: (state, action: PayloadAction<SetupImportInfo>) => {
      state.importInfo = action.payload;
    },
  },
});

export const { updateUI, updateSetupImportInfo } = uiSlice.actions;

export default uiSlice.reducer;
