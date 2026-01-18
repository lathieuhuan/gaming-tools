import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/shallow";

import { $AppSettings } from "@/services";
import { UIState } from "./types";

const { isTabLayout } = $AppSettings.get();

const initialState: UIState = {
  isTabLayout,
  appModalType: "",
  mySetupsModalType: "",
  targetConfig: {
    active: false,
    overviewed: true,
  },
  setupDirectorActive: false,
  trackerState: "close",
  loading: false,
  appReady: false,
};

export const useUIStore = create<UIState>()(immer(() => initialState));

export const useShallowUIStore = <T>(selector: (state: UIState) => T) => {
  return useUIStore(useShallow(selector));
};
