import { AppCharacter } from "@Backend";
import { SimulationMember, SimulationPartyData, SimulationTarget } from "@Src/types";
import { createContext, useContext } from "react";
import { ActiveMemberTools } from "./tools";

export type ActiveSimulationInfo = {
  partyData: SimulationPartyData;
  target: SimulationTarget;
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
