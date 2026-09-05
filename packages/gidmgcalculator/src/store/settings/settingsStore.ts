import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { AppSettingsState } from "./types";

import { DEFAULT_TRAVELER } from "@/constants/settings";

// KEEP THIS STORE CLEAN OF OTHER STORES AND LOGIC
// IT SHOULD ONLY USE SERVICES AND PURE UTILS

const initialState: AppSettingsState = {
  traveler: DEFAULT_TRAVELER,
  persistUserData: false,
  isTabLayout: true,
  separateCharInfo: false,
  keepArtStatsOnSwitch: false,
  askBeforeUnload: true,
  charLevel: "1/20",
  charCons: 0,
  charNAs: 1,
  charES: 1,
  charEB: 1,
  charEnhanced: false,
  wpLevel: "1/20",
  wpRefi: 1,
  artLevel: 0,
  targetLevel: 1,
};

export const useSettingsStore = create<AppSettingsState>()(
  persist(
    immer(() => initialState),
    {
      name: "storage:settings",
    },
  ),
);
