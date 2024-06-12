import { createContext, useContext } from "react";
import { AppCharacter } from "@Backend";
import { SimulationMember } from "@Src/types";
import { ActiveMemberTools } from "../tools";

export type ActiveMemberInfo = {
  info: Pick<SimulationMember, "name" | "level" | "cons" | "NAs" | "ES" | "EB" | "weapon" | "artifacts">;
  data: AppCharacter;
  tools: ActiveMemberTools;
};

export const ActiveMemberContext = createContext<ActiveMemberInfo | null | undefined>(null);

export function useActiveMember() {
  return useContext(ActiveMemberContext);
}
