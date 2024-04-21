import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { $AppSettings, AppSettings } from "@Src/services";
import type { SetupImportInfo, TrackerState } from "@Src/types";

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

export interface UIState extends Pick<AppSettings, "isTabLayout"> {
  ready: boolean;
  loading: boolean;
  atScreen: AppScreen;
  appModalType: "" | "INTRO" | "GUIDES" | "SETTINGS" | "UPLOAD" | "DOWNLOAD" | "DONATE";
  calcTargetConfig: {
    active: boolean;
    onOverview: boolean;
  };
  setupDirectorActive: boolean;
  trackerState: TrackerState;
  mySetupsModalType: MySetupsModalType;
  importInfo: SetupImportInfo;
}

const initialState: UIState = {
  isTabLayout: $AppSettings.get("isTabLayout"),
  atScreen: "CALCULATOR",
  appModalType: "INTRO",
  mySetupsModalType: "",
  calcTargetConfig: {
    active: false,
    onOverview: true,
  },
  setupDirectorActive: false,
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
