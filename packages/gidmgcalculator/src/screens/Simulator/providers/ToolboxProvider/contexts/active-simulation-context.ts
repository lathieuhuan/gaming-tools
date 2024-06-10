import { createContext, useContext } from "react";
import { PartyData, SimulationTarget } from "@Src/types";

export type ActiveSimulationInfo = {
  partyData: PartyData;
  target: SimulationTarget;
};

export const ActiveSimulationContext = createContext<ActiveSimulationInfo | null>(null);

export function useActiveSimulation() {
  return useContext(ActiveSimulationContext);
}
