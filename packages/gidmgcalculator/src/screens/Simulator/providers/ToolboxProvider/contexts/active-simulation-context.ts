import { createContext, useContext } from "react";
import { PartyData } from "@Src/types";

export type ActiveSimulationInfo = {
  partyData: PartyData;
};

export const ActiveSimulationContext = createContext<ActiveSimulationInfo | null>(null);

export function useActiveSimulation() {
  return useContext(ActiveSimulationContext);
}
