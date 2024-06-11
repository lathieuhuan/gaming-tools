import { createContext, useContext } from "react";
import { TotalAttributeControl } from "@Backend";

export const ToolsContext = createContext<TotalAttributeControl | null>(null);

export function useTools() {
  return useContext(ToolsContext);
}
