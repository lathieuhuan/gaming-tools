import { SearchParams } from "@/systems/router";
import { TourType, UIState } from "./types";
import { useUIStore } from "./uiStore";

export const updateUI = (state: Partial<UIState>) => {
  useUIStore.setState(state);
};

export const updateEnkaParams = (params: SearchParams) => {
  useUIStore.setState({ enkaParams: params });
};

export const setTourType = (tourType: TourType) => {
  useUIStore.setState({ tourType });
};
