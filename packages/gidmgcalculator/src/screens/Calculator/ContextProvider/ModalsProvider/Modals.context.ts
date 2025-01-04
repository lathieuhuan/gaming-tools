import { createContext } from "react";

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
  requestOptimize: (setupId?: number) => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);
