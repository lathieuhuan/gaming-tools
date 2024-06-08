import { createContext, useContext } from "react";
import { AppCharacter } from "@Backend";
import { SimulationMember } from "@Src/types";

export type ActiveMemberInfo = {
  char: Pick<SimulationMember, "name" | "level" | "cons" | "NAs" | "ES" | "EB" | "weapon" | "artifacts">;
  appChar: AppCharacter;
};

export const ActiveMemberContext = createContext<ActiveMemberInfo | null>(null);

export function useActiveMember() {
  return useContext(ActiveMemberContext);
}
