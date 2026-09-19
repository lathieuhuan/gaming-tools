import { createContext, Dispatch, SetStateAction, useContext } from "react";

import { MultiSetupChange } from "@Store/calculator/actions";

type SetupMultiUpdateKitContextType = {
  setups: MultiSetupChange[];
  standardId: number;
  canAddMoreSetup: boolean;
  updateSetups: Dispatch<SetStateAction<MultiSetupChange[]>>;
  setStandardId: Dispatch<SetStateAction<number>>;
};

export const Context = createContext<SetupMultiUpdateKitContextType | null>(null);

export function useSetupMultiUpdateKit() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useSetupMultiUpdateKit must be used within a SetupMultiUpdateKit");
  }
  return context;
}
