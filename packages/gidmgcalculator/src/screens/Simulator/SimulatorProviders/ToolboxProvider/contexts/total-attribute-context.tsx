import { createContext, useContext } from "react";
import { TotalAttributeControl } from "@Simulator/controls";

export const TotalAttributeContext = createContext<TotalAttributeControl | null>(null);

export function useTotalAttribute() {
  return useContext(TotalAttributeContext);
}
