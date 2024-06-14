import { createContext, useContext } from "react";
import type { AppCharacter } from "@Backend";
import type { SimulationMember, SimulationPartyData, SimulationTarget } from "@Src/types";
import type { ActiveMemberTools, SimulationControl } from "./tools";

export type ActiveSimulationInfo = {
  partyData: SimulationPartyData;
  target: SimulationTarget;
  subscribeEvents: SimulationControl['subscribeEvents'];
};

export const ActiveSimulationContext = createContext<ActiveSimulationInfo | null | undefined>(null);

export function useActiveSimulation() {
  return useContext(ActiveSimulationContext);
}

export type ActiveMemberInfo = {
  info: Pick<SimulationMember, "name" | "level" | "cons" | "NAs" | "ES" | "EB" | "weapon" | "artifacts">;
  data: AppCharacter;
  tools: ActiveMemberTools;
};

export const ActiveMemberContext = createContext<ActiveMemberInfo | null | undefined>(null);

export function useActiveMember() {
  return useContext(ActiveMemberContext);
}
