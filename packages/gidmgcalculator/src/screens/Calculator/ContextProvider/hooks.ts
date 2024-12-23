import { useContext } from "react";
import { CalculatorModalsContext, CharacterDataContext, OptimizerStatusContext, PartyDataContext } from "./contexts";

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

export const useOptimizerStatus = () => {
  const context = useContext(OptimizerStatusContext);

  if (!context) {
    throw new Error("useOptimizerStatus must be used inside Calculator/ContextProvider");
  }
  return context;
};
