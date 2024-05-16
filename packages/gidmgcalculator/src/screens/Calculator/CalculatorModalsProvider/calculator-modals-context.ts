import { createContext, useContext } from "react";

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);

export function useCalcModalCtrl() {
  const context = useContext(CalculatorModalsContext);
  if (!context) {
    throw new Error("useCalcModalCtrl must be used inside CalculatorContextProvider");
  }
  return context;
}
