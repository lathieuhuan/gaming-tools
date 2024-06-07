import { createContext, useContext } from "react";
import { SimulationMember } from "@Src/types";
import { AppCharacter } from "@Backend";

type ActiveMemberInfo = {
  char: SimulationMember;
  appChar: AppCharacter;
};

export const ActiveMemberContext = createContext<ActiveMemberInfo | null>(null);

export function useActiveMember() {
  const context = useContext(ActiveMemberContext);
  if (!context) {
    throw new Error("useToolbox must be used inside ToolboxContext");
  }
  return context;
}
