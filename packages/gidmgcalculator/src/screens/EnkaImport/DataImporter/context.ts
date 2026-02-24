import { UseQueryResult } from "@tanstack/react-query";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

import type { GenshinUser } from "@/services/enka";
import type { SelectedBuild } from "../types";

export type DataImportContextState = UseQueryResult<GenshinUser>;

export const DataImportContext = createContext<DataImportContextState | null>(null);

export function useDataImportState() {
  const context = useContext(DataImportContext);

  if (!context) {
    throw new Error("useDataImportState must be used within a DataImportProvider");
  }

  return context;
}

// Selected Build

export type SelectedBuildContextState = [
  SelectedBuild | undefined,
  Dispatch<SetStateAction<SelectedBuild | undefined>>
];

export const SelectedBuildContext = createContext<SelectedBuildContextState>([
  undefined,
  () => undefined,
]);

export function useSelectedBuildState() {
  return useContext(SelectedBuildContext);
}
