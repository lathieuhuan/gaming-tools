import type { RootState } from "@/store";

export const selectMySetupModalType = (state: RootState) => state.ui.mySetupsModalType;

export const selectAppReady = (state: RootState) => state.ui.appReady;

export const selectTargetConfig = (state: RootState) => state.ui.targetConfig;

export const selectEnkaParams = (state: RootState) => state.ui.enkaParams;