import { createContext } from "react";
import type { AppCharacter } from "@Backend";
import type { PartyData } from "@Src/types";

export const CharacterDataContext = createContext<AppCharacter | undefined>(undefined);

export const PartyDataContext = createContext<PartyData | undefined>(undefined);

export type CalculatorModalsControl = {
  requestSwitchCharacter: () => void;
  requestImportSetup: () => void;
  requestSaveSetup: (setupId: number) => void;
  requestShareSetup: (setupId: number) => void;
};

export const CalculatorModalsContext = createContext<CalculatorModalsControl | null>(null);

export type OptimizerStatus = {
  active: boolean;
};

export type OptimizerStatusContextModel = {
  value: OptimizerStatus;
  toggle: (active?: boolean) => void;
};

export const OptimizerStatusContext = createContext<OptimizerStatusContextModel | null>(null);
