import type { SearchParams } from "@/systems/router";

type AppModalType =
  | "INTRO"
  | "GUIDES"
  | "SETTINGS"
  | "UPLOAD"
  | "DOWNLOAD"
  | "DONATE"
  | "DATA_REPAIR"
  | "ENHANCE_NOTICE"
  | "";

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
  appModalType: AppModalType;
  targetConfig: {
    active: boolean;
    overviewed: boolean;
  };
  setupDirectorActive: boolean;
  trackerState: TrackerState;
  mySetupsModalType: MySetupsModalType;
  tourType: TourType;
  enkaParams?: SearchParams;
};
