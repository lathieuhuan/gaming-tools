import { createContext } from "react";

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);
