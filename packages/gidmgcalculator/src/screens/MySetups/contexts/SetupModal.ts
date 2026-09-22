import { createContext, useContext } from "react";

export type SetupModalType = "SHARE" | "REMOVE" | "WEAPON" | "ARTIFACTS" | "STATS" | "MODIFIERS";

export const SetupModalContext = createContext<(modalType: SetupModalType) => void>(() => {});

export function useOpenSetupModal() {
  return useContext(SetupModalContext);
}
