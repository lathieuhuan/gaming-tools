import { createContext, useContext } from "react";
import { AppCharacter } from "@Backend";
import { SimulationMember } from "@Src/types";

export type ActiveMemberInfo = {
  char: SimulationMember["info"];
  appChar: AppCharacter;
};

export const ActiveMemberContext = createContext<ActiveMemberInfo | null>(null);

export function useActiveMember() {
  return useContext(ActiveMemberContext);
}
