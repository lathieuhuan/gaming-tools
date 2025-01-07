import { useContext } from "react";
import { CalculatorModalsContext } from "./ModalsProvider/Modals.context";
import { CharacterDataContext } from "./CharacterDataProvider/CharacterData.context";
import { OptimizeDirectorContext } from "./OptimizeDirectorProvider/OptimizeDirector.context";

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

export const useOptimizeDirector = () => {
  const context = useContext(OptimizeDirectorContext);

  if (!context) {
    throw new Error("useOptimizeDirector must be used inside Calculator/ContextProvider");
  }
  return context;
};
