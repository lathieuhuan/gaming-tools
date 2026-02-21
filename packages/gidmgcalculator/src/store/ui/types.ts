import type { SearchParams } from "@/systems/router";
import type { TourKey } from "@/types";

type AppModalType =
  | "INTRO"
  | "GUIDES"
  | "SETTINGS"
  | "UPLOAD"
  | "DOWNLOAD"
  | "DONATE"
  | "DATA_REPAIR"
  | "TOUR_CATALOGUE"
  | "CHAR_ENHANCE_NOTICE"
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
