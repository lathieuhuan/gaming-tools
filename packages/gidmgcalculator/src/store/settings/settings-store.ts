import { $AppCharacter } from "@/services";
import { DeepPartial } from "@reduxjs/toolkit";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { Level } from "@/types";
import type { AppSettingsState } from "./types";

import Object_ from "@/utils/Object";

// KEEP THIS STORE CLEAN OF OTHER STORES AND LOGIC
// IT SHOULD ONLY USE SERVICES AND PURE UTILS

// TODO: Remove from here after 1/4/2026

type LegacySettings = {
  separateCharInfo: boolean;
  keepArtStatsOnSwitch: boolean;
  persistUserData: boolean;
  isTabLayout: boolean;
  askBeforeUnload: boolean;
  charLevel: Level;
  charCons: number;
  charNAs: number;
  charES: number;
  charEB: number;
  charEnhanced: boolean;
  wpLevel: Level;
  wpRefi: number;
  artLevel: number;
  targetLevel: number;
};

const getLegacyPersistState = (): DeepPartial<AppSettingsState> | undefined => {
  try {
    const oldPersistAccount = localStorage.getItem("persist:account");
    const parsedAccount = oldPersistAccount && JSON.parse(oldPersistAccount);
    const travelerString: string | undefined = parsedAccount?.traveler;

    if (!travelerString) {
      throw new Error();
    }

    const oldSettings = localStorage.getItem("settings");
    const parsedSettings: LegacySettings | undefined = oldSettings && JSON.parse(oldSettings);

    return {
      traveler: JSON.parse(travelerString),
      ...parsedSettings,
    };
  } catch (error) {
    return undefined;
  }
};

// till here

const initialState: AppSettingsState = {
  traveler: $AppCharacter.DEFAULT_TRAVELER,
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
      name: "settings-storage",
      // TODO: Remove after 1/4/2026
      merge: (persisted, current) => {
        const persistState =
          (persisted as AppSettingsState | undefined) || getLegacyPersistState() || initialState;

        return Object_.deepMerge(current, persistState);
      },
      skipHydration: true,
    }
  )
);
