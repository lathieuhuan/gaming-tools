import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ModCategory, Simulation } from "./types";

export type SimulationManager = {
  id: number;
  name: string;
};

export type SimulatorPhase = "PREP" | "BUILD";

export type SimulatorState = {
  sidebarOpen: boolean;
  phase: SimulatorPhase;
  managers: SimulationManager[];
  activeId: number;
  simulationsById: Record<string, Simulation>;
};

const initialState: SimulatorState = {
  sidebarOpen: false,
  phase: "PREP",
  managers: [],
  activeId: 0,
  simulationsById: {},
};

export const useSimulatorStore = create<SimulatorState>()(immer(() => initialState));

export const selectSimulation = (state: SimulatorState, id = state.activeId) =>
  state.simulationsById[id];

export const selectActiveMember = (state: SimulatorState) => {
  const { activeMember, memberOrder, processor } = selectSimulation(state);
  return processor.members[activeMember] || processor.members[memberOrder[0]];
};

export const selectProcessor = (state: SimulatorState, id?: number) => {
  return selectSimulation(state, id).processor;
};

export const selectModInputs = (category: ModCategory) => (state: SimulatorState) => {
  const simulation = selectSimulation(state);

  return simulation.inputs[simulation.activeMember][category];
};

// export const useShallowSimulatorStore = <T>(selector: (state: SimulatorState) => T) => {
//   return useSimulatorStore(useShallow(selector));
// };
