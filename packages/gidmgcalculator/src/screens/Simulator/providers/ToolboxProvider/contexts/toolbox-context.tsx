import { createContext, useContext } from "react";
import { SimulatorBuffApplier, TotalAttributeControl } from "@Backend";

export type SimulatorToolbox = {
  totalAttr: TotalAttributeControl;
  buffApplier: SimulatorBuffApplier;
};

export const ToolboxContext = createContext<SimulatorToolbox | null>(null);

export function useToolbox() {
  return useContext(ToolboxContext);
}
