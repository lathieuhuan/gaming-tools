import type { RootState } from "@Src/store";

export const selectMySetupModalType = (state: RootState) => state.ui.mySetupsModalType;

export const selectIsReadyApp = (state: RootState) => state.ui.ready;
