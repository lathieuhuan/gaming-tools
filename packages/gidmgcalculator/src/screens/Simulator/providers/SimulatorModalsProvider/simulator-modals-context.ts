import { createContext, useContext } from "react";

export type SimulatorModalsControl = {
  requestAddSimulation: () => void;
};

export const SimulatorModalsContext = createContext<SimulatorModalsControl | null>(null);

export function useSimModalCtrl() {
  const context = useContext(SimulatorModalsContext);
  if (!context) {
    throw new Error("useSimModalCtrl must be used inside SimulatorModalsContext");
  }
  return context;
}
