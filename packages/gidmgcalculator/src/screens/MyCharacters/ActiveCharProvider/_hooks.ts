import { useContext } from "react";
import { ActiveCharActionContext, ActiveCharContext } from "./_context";

export function useActiveChar() {
  const context = useContext(ActiveCharContext);
  if (!context) {
    throw new Error("useActiveChar must be used inside ActiveCharProvider");
  }
  return context;
}

export function useActiveCharActions() {
  const context = useContext(ActiveCharActionContext);
  if (!context) {
    throw new Error("useActiveCharAction must be used inside ActiveCharProvider");
  }
  return context;
}
