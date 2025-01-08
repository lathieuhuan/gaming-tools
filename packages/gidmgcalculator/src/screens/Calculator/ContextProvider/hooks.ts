import { useContext } from "react";
import { CalculatorModalsContext } from "./ModalsProvider/Modals.context";
import { CharacterDataContext } from "./CharacterDataProvider/CharacterData.context";
import { OptimizeSystemContext } from "./OptimizeSystemProvider/OptimizeSystem.context";

export function useCharacterData() {
  const context = useContext(CharacterDataContext);
  if (!context) {
    throw new Error("useCharacterData must be used inside Calculator/ContextProvider");
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

export const useOptimizeSystem = () => {
  const context = useContext(OptimizeSystemContext);

  if (!context) {
    throw new Error("useOptimizeSystem must be used inside Calculator/ContextProvider");
  }
  return context;
};
