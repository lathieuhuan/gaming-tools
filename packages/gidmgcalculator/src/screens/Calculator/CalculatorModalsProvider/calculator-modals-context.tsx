import { createContext, useContext } from "react";

export type CalculatorModalsControl = {
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);

export function useCalculatorModalControl() {
  const context = useContext(CalculatorModalsContext);
  if (!context) {
    throw new Error("useCalculatorModalControl must be used inside CalculatorContextProvider");
  }
  return context;
}
