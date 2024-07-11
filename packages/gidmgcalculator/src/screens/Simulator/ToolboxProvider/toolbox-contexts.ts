import { createContext, useContext } from "react";
import type { AppCharacter } from "@Backend";
import type { SimulationMember, SimulationPartyData, SimulationTarget } from "@Src/types";
import type { ConfigTalentHitEventArgs, SimulationControl, TalentEventConfig } from "./tools";

export type ActiveSimulation = Pick<
  SimulationControl,
  | "getMemberInfo"
  | "getMemberData"
  | "getAppWeaponOfMember"
  | "subscribeChunks"
  | "subscribeTotalAttr"
  | "subscribeBonuses"
> & {
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

type ConfigTalentHitEvent = (args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => TalentEventConfig;

export type ActiveMember = {
  info: Pick<SimulationMember, "name" | "level" | "cons" | "NAs" | "ES" | "EB" | "weapon" | "artifacts">;
  data: AppCharacter;
  tools: {
    configTalentHitEvent: ConfigTalentHitEvent;
  };
};

export const ActiveMemberContext = createContext<ActiveMember | null | undefined>(undefined);

export function useActiveMember() {
  const context = useContext(ActiveMemberContext);
  if (context === undefined) {
    throw new Error("useActiveMember must be used inside ActiveMemberContext");
  }
  return context;
}
