import { createContext, useContext } from "react";
import { AppCharacter } from "@Backend";
import { SimulationMember } from "@Src/types";

type ActiveMemberInfo = {
  char: SimulationMember;
  appChar: AppCharacter;
};

export const ActiveMemberContext = createContext<ActiveMemberInfo | null>(null);

export function useActiveMember() {
  return useContext(ActiveMemberContext);
}
