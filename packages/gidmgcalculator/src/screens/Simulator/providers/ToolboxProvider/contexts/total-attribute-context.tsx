import { createContext, useContext } from "react";
import { TotalAttributeControl } from "@Backend";

export const TotalAttributeContext = createContext<TotalAttributeControl | null>(null);

export function useTotalAttribute() {
  return useContext(TotalAttributeContext);
}
