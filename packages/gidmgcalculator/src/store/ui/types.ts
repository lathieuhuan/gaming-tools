import { AppSettings } from "@/services/app-settings";
import { SearchParams } from "@/systems/router";

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

export type UIState = Pick<AppSettings, "isTabLayout"> & {
  loading: boolean;
  appReady: boolean;
  appModalType: "" | "INTRO" | "GUIDES" | "SETTINGS" | "UPLOAD" | "DOWNLOAD" | "DONATE" | "DATA_FIX";
  targetConfig: {
    active: boolean;
    overviewed: boolean;
  };
  setupDirectorActive: boolean;
  trackerState: TrackerState;
  mySetupsModalType: MySetupsModalType;
  enkaParams?: SearchParams;
};
