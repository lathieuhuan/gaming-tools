import { useContext } from "react";
import { CalculatorModalsContext, CharacterDataContext, OptimizerContext, PartyDataContext } from "./contexts";

export function useCharacterData() {
  const context = useContext(CharacterDataContext);
  if (!context) {
    throw new Error("useCharacterData must be used inside Calculator/ContextProvider");
  }
  return context;
}

export function usePartyData() {
  const context = useContext(PartyDataContext);
  if (!context) {
    throw new Error("usePartyData must be used inside Calculator/ContextProvider");
  }
  return context;
}

export function useCalcModalCtrl() {
  const context = useContext(CalculatorModalsContext);
  if (!context) {
    throw new Error("useCalcModalCtrl must be used inside Calculator/ContextProvider");
  }
  return context;
}

export const useOptimizer = () => {
  const context = useContext(OptimizerContext);

  if (!context) {
    throw new Error("useOptimizer must be used inside Calculator/ContextProvider");
  }
  return context;
};
