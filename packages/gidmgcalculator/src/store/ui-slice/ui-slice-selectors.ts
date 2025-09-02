import type { RootState } from "@/store";

export const selectMySetupModalType = (state: RootState) => state.ui.mySetupsModalType;

export const selectAppReady = (state: RootState) => state.ui.appReady;

export const selectTraveler = (state: RootState) => state.ui.traveler;

export const selectTargetConfig = (state: RootState) => state.ui.targetConfig;
