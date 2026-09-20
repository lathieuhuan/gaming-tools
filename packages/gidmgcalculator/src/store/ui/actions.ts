import { SearchParams } from "@/lib/router";
import type { SetupImportInfo, TourType, UIState } from "./types";
import { useUIStore } from "./uiStore";

export const updateUI = (state: Partial<UIState>) => {
  useUIStore.setState(state);
};

export const updateEnkaParams = (params: SearchParams) => {
  useUIStore.setState({ enkaParams: params });
};

export const setTourType = (tourType: TourType | undefined) => {
  useUIStore.setState({ tourType });
};

export const importSetup = (importInfo: SetupImportInfo) => {
  useUIStore.setState({ setupImportInfo: importInfo });
};
