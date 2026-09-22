import type { SearchParams } from "@/lib/router";
import type { CreateCalcSetupOptions } from "@/logic/calculator";
import type { Character } from "@/models/Character";
import type { BasicSetupType, TourKey } from "@/types";

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

export type SetupImportMeta = {
  id: number;
  name: string;
  type?: BasicSetupType;
  source: "CALCULATOR" | "URL" | "MY_SETUPS" | "ENKA";
};

export type SetupImportParams = CreateCalcSetupOptions & {
  main: Character;
};

export type SetupImportInfo = {
  meta: SetupImportMeta;
  params: SetupImportParams;
};

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
  setupImportInfo: SetupImportInfo | null;
  tourType?: TourType;
  enkaParams?: SearchParams;
};
