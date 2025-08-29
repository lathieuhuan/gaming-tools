import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { $AppSettings, AppSettings } from "@Src/services";
import type { SetupImportInfo, Traveler } from "@Src/types";

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

export type TrackerState = "open" | "close" | "hidden";

export interface UIState extends Pick<AppSettings, "isTabLayout"> {
  ready: boolean;
  loading: boolean;
  traveler: Traveler;
  appModalType: "" | "INTRO" | "GUIDES" | "SETTINGS" | "UPLOAD" | "DOWNLOAD" | "DONATE";
  targetConfig: {
    active: boolean;
    overviewed: boolean;
  };
  setupDirectorActive: boolean;
  trackerState: TrackerState;
  mySetupsModalType: MySetupsModalType;
  importInfo: SetupImportInfo;
}

const { isTabLayout, traveler } = $AppSettings.get();

const initialState: UIState = {
  isTabLayout,
  traveler,
  appModalType: "",
  mySetupsModalType: "",
  targetConfig: {
    active: false,
    overviewed: true,
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
