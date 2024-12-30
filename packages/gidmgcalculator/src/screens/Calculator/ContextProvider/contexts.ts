import { createContext } from "react";
import type { AppCharacter } from "@Backend";
import type { CalcAppParty } from "@Src/types";
import type { OptimizerState } from "./OptimizerProvider";

export const CharacterDataContext = createContext<AppCharacter | undefined>(undefined);

export const PartyDataContext = createContext<CalcAppParty | undefined>(undefined);

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);

export const OptimizerStateContext = createContext<OptimizerState | null>(null);
