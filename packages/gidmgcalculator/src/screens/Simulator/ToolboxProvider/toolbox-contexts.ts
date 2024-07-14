import { createContext, useContext } from "react";
import type { ActiveMember, SimulationManager } from "./simulation-control";

export const ActiveSimulationContext = createContext<SimulationManager | null | undefined>(undefined);

export function useActiveSimulation() {
  const context = useContext(ActiveSimulationContext);
  if (context === undefined) {
    throw new Error("useActiveSimulation must be used inside ActiveSimulationContext");
  }
  return context;
}

export const ActiveMemberContext = createContext<ActiveMember | null | undefined>(undefined);

export function useActiveMember() {
  const context = useContext(ActiveMemberContext);
  if (context === undefined) {
    throw new Error("useActiveMember must be used inside ActiveMemberContext");
  }
  return context;
}
