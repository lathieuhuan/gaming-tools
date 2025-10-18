import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SelectedBuild } from "../types";

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
