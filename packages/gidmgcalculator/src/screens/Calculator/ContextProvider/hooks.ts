import { useContext } from "react";
import { CalculatorModalsContext } from "./ModalsProvider/Modals.context";
import { CharacterDataContext } from "./CharacterDataProvider/CharacterData.context";
import { OptimizerStateContext } from "./OptimizerProvider/OptimizerState.context";

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

export const useOptimizerState = () => {
  const context = useContext(OptimizerStateContext);

  if (!context) {
    throw new Error("useOptimizerState must be used inside Calculator/ContextProvider");
  }
  return context;
};
