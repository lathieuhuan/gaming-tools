import { createContext, useContext } from "react";
import { TotalAttributeControl } from "../../../controls";

export const TotalAttributeContext = createContext<TotalAttributeControl | null>(null);

export function useTotalAttribute() {
  const context = useContext(TotalAttributeContext);
  if (!context) {
    throw new Error("useTotalAttribute must be used inside TotalAttributeContext");
  }
  return context;
}
