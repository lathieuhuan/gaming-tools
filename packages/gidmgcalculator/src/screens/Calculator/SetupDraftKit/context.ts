import { createContext, Dispatch, useContext } from "react";

import { MultiSetupChange } from "@Store/calculator/actions";
import type { SetupDraftKitAction } from "./reducer";

type SetupDraftKitContextType = {
  setups: MultiSetupChange[];
  standardId: number;
  canAddMoreSetup: boolean;
  dispatch: Dispatch<SetupDraftKitAction>;
  apply: () => boolean;
};

export const Context = createContext<SetupDraftKitContextType | null>(null);

export function useSetupDraftKit() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useSetupDraftKit must be used within a SetupDraftKit");
  }
  return context;
}
