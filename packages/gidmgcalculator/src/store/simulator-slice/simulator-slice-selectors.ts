import { Simulation } from "@Src/types";
import type { RootState } from "../index";

export const selectActiveSimulation = (state: RootState): Simulation | null => {
  const { activeId, simulationsById } = state.simulator;
  return simulationsById[activeId] ?? null;
};
