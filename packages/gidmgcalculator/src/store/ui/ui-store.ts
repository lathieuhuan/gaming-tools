import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
// import { useShallow } from "zustand/shallow";

import type { UIState } from "./types";

const initialState: UIState = {
  appModalType: "",
  mySetupsModalType: "",
  targetConfig: {
    active: false,
    overviewed: true,
  },
  setupDirectorActive: false,
  trackerState: "close",
  tourType: "",
  appReady: false,
};

export const useUIStore = create<UIState>()(immer(() => initialState));

// export const useShallowUIStore = <T>(selector: (state: UIState) => T) => {
//   return useUIStore(useShallow(selector));
// };
