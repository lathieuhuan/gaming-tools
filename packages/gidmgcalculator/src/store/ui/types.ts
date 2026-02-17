import type { SearchParams } from "@/systems/router";

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

export type TourType = "ENHANCE" | "";

export type UIState = {
  appReady: boolean;
  appModalType:
    | ""
    | "INTRO"
    | "GUIDES"
    | "SETTINGS"
    | "UPLOAD"
    | "DOWNLOAD"
    | "DONATE"
    | "DATA_FIX";
  targetConfig: {
    active: boolean;
    overviewed: boolean;
  };
  setupDirectorActive: boolean;
  trackerState: TrackerState;
  tourType: TourType;
  mySetupsModalType: MySetupsModalType;
  enkaParams?: SearchParams;
};
