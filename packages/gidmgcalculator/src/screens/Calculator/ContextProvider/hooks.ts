import { useContext } from "react";
import {
  CalculatorModalsContext,
  CharacterDataContext,
  OptimizerStateContext,
  PartyDataContext,
  CharacterRecordContext,
} from "./contexts";

// #TO-DO: check if needed
export function useCharacterData() {
  const context = useContext(CharacterDataContext);
  if (!context) {
    throw new Error("useCharacterData must be used inside Calculator/ContextProvider");
  }
  return context;
}

// #TO-DO: check if needed
export function usePartyData() {
  const context = useContext(PartyDataContext);
  if (!context) {
    throw new Error("usePartyData must be used inside Calculator/ContextProvider");
  }
  return context;
}

/** Only NOT read  */
export function useCharacterRecord() {
  const context = useContext(CharacterRecordContext);
  if (!context) {
    throw new Error("useCharacterRecord must be used inside Calculator/ContextProvider");
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
