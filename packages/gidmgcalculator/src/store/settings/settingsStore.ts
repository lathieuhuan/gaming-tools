import { DeepPartial } from "@reduxjs/toolkit";
import { Object_ } from "ron-utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { Level, TravelerConfig } from "@/types";
import type { AppSettingsState } from "./types";

import { $AppCharacter } from "@/services";

// KEEP THIS STORE CLEAN OF OTHER STORES AND LOGIC
// IT SHOULD ONLY USE SERVICES AND PURE UTILS

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

const getLegacyPersistState = (): DeepPartial<AppSettingsState> => {
  try {
    const oldPersistAccount = localStorage.getItem("persist:account");

    const parsedAccount: { traveler?: TravelerConfig | string } = oldPersistAccount
      ? JSON.parse(oldPersistAccount)
      : {};

    const persistTraveler = parsedAccount.traveler;

    if (!persistTraveler) {
      return initialState;
    }

    const traveler: TravelerConfig =
      typeof persistTraveler === "string" ? JSON.parse(persistTraveler) : persistTraveler;

    const oldSettings = localStorage.getItem("settings");
    const parsedSettings: LegacySettings | null = oldSettings ? JSON.parse(oldSettings) : null;

    return Object_.deepMerge(initialState, {
      traveler,
      ...parsedSettings,
    });
  } catch {
    return initialState;
  }
};

// till here

export const useSettingsStore = create<AppSettingsState>()(
  persist(
    immer(() => initialState),
    {
      name: "storage:settings",
      // TODO: Remove after 1/4/2026
      merge: (persisted, current) => {
        const persistState = (persisted as AppSettingsState | undefined) || getLegacyPersistState();

        return Object_.deepMerge(current, persistState);
      },
      skipHydration: true,
    }
  )
);
