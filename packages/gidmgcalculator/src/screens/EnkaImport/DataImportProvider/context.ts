import { GenshinUser } from "@/services/enka";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SelectedBuild } from "../types";
import { UseQueryResult } from "@tanstack/react-query";

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
