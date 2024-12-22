import { createContext } from "react";
import type { AppCharacter } from "@Backend";
import type { PartyData } from "@Src/types";
import type { OptimizerManager } from "./utils/optimizer-manager";

export const CharacterDataContext = createContext<AppCharacter | undefined>(undefined);

export const PartyDataContext = createContext<PartyData | undefined>(undefined);

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
  requestOptimize: () => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);

export const OptimizerContext = createContext<OptimizerManager | null>(null);
