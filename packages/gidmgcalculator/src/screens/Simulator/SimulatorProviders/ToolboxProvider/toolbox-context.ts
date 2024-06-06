import { createContext, useContext } from "react";
import { TotalAttributeControl } from "../../controls";
import { PartyData, SimulationMember } from "@Src/types";
import { AppCharacter } from "@Backend";

type SimulatorToolbox = {
  char: SimulationMember;
  appChar: AppCharacter;
  partyData: PartyData;
  
  totalAttrCtrl: TotalAttributeControl;
};

export const ToolboxContext = createContext<SimulatorToolbox | null>(null);

export function useToolbox() {
  const context = useContext(ToolboxContext);
  if (!context) {
    throw new Error("useToolbox must be used inside ToolboxContext");
  }
  return context;
}
