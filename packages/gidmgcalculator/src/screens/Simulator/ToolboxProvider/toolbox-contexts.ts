import { createContext, useContext } from "react";
import type { AppCharacter } from "@Backend";
import type { SimulationMember, SimulationPartyData, SimulationTarget } from "@Src/types";
import type { ActiveMemberTools, SimulationControl } from "./tools";

export type ActiveSimulation = Pick<SimulationControl, "getLastestChunk" | "getMemberData" | "subscribeChunks"> & {
  partyData: SimulationPartyData;
  target: SimulationTarget;
};

export const ActiveSimulationContext = createContext<ActiveSimulation | null | undefined>(undefined);

export function useActiveSimulation() {
  const context = useContext(ActiveSimulationContext);
  if (context === undefined) {
    throw new Error("useActiveSimulation must be used inside ActiveSimulationContext");
  }
  return context;
}

export type ActiveMember = {
  info: Pick<SimulationMember, "name" | "level" | "cons" | "NAs" | "ES" | "EB" | "weapon" | "artifacts">;
  data: AppCharacter;
  tools: ActiveMemberTools;
};

export const ActiveMemberContext = createContext<ActiveMember | null | undefined>(undefined);

export function useActiveMember() {
  const context = useContext(ActiveMemberContext);
  if (context === undefined) {
    throw new Error("useActiveMember must be used inside ActiveMemberContext");
  }
  return context;
}
