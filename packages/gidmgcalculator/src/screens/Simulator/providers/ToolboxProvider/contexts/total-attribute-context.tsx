import { createContext, useContext } from "react";
import { TotalAttributeControl } from "@Simulator/calculation";

export const TotalAttributeContext = createContext<TotalAttributeControl | null>(null);

export function useTotalAttribute() {
  return useContext(TotalAttributeContext);
}
