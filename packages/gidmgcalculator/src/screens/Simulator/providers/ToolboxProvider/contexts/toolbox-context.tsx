import { createContext, useContext } from "react";
import { SimulatorBuffApplier, TotalAttributeControl } from "@Backend";

type Toolbox = {
  totalAttr: TotalAttributeControl;
  buffApplier: SimulatorBuffApplier;
};

export const ToolboxContext = createContext<Toolbox | null>(null);

export function useToolbox() {
  return useContext(ToolboxContext);
}
