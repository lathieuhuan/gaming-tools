import { AppCharacter } from "@Backend";
import { createContext, useContext } from "react";

export type CalculatorInfo = {
  appChar: AppCharacter;
};

export const CalculatorInfoContext = createContext<CalculatorInfo | null>(null);

export function useCalcAppCharacter(): AppCharacter {
  const context = useContext(CalculatorInfoContext);

  if (!context) {
    throw new Error("useCalculatorInfo must be used inside CalculatorInfoProvider");
  }
  return context?.appChar;
}
