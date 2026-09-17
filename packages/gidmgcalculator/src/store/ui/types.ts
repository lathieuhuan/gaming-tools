import type { SearchParams } from "@/lib/router";
import type { TourKey } from "@/types";

export type AppModalType =
  | "INTRO"
  | "GUIDES"
  | "VERSIONS"
  | "SETTINGS"
  | "UPLOAD"
  | "DOWNLOAD"
  | "DONATE"
  | "DATA_REPAIR"
  | "TRAVEL_AGENCY"
  | "CHAR_ENHANCE_NOTICE"
  | "";

export type MySetupsModalType = "FIRST_COMBINE" | "COMBINE_MORE" | "";

export type TrackerState = "open" | "close" | "hidden";

export type TourType = TourKey | "MAIN_ENHANCE" | "TEAMMATE_ENHANCE";

export type UIState = {
  appReady: boolean;
  appModalType: AppModalType;
  mySetupsModalType: MySetupsModalType;
  targetConfig: {
    active: boolean;
    overviewed: boolean;
  };
  setupDirectorActive: boolean;
  trackerState: TrackerState;
  tourType?: TourType;
  enkaParams?: SearchParams;
};
