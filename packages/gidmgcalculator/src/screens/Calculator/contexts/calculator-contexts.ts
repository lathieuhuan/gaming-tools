import { createContext, useContext } from "react";
import type { AppCharacter } from "@Backend";
import type { PartyData } from "@Src/types";

export const CharacterDataContext = createContext<AppCharacter | undefined>(undefined);

export function useCharacterData() {
  const context = useContext(CharacterDataContext);
  if (!context) {
    throw new Error("useCharacterData must be used inside CharacterDataContext.Provider");
  }
  return context;
}

export const PartyDataContext = createContext<PartyData | undefined>(undefined);

export function usePartyData() {
  const context = useContext(PartyDataContext);
  if (!context) {
    throw new Error("usePartyData must be used inside PartyDataContext.Provider");
  }
  return context;
}

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
  requestOptimize: () => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);

export function useCalcModalCtrl() {
  const context = useContext(CalculatorModalsContext);
  if (!context) {
    throw new Error("useCalcModalCtrl must be used inside CalculatorContextProvider");
  }
  return context;
}
