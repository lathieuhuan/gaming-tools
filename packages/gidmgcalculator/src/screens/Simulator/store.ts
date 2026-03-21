import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Simulation } from "./types";

type SimulationManager = {
  id: number;
  name: string;
};

type Step = "PREP" | "BUILD";

export type SimulatorState = {
  step: Step;
  managers: SimulationManager[];
  activeId: number;
  simulationsById: Record<string, Simulation>;
};

const initialState: SimulatorState = {
  step: "PREP",
  managers: [],
  activeId: 0,
  simulationsById: {},
};

export const useSimulatorStore = create<SimulatorState>()(immer(() => initialState));

export const selectSimulation = (state: SimulatorState, id = state.activeId) =>
  state.simulationsById[id];

export const selectActiveMember = (state: SimulatorState) => {
  const { activeMember, members, memberOrder } = selectSimulation(state);
  return members[activeMember] || members[memberOrder[0]];
};

export const selectProcessor = (state: SimulatorState, id?: number) => {
  return selectSimulation(state, id).processor;
};

// export const useShallowSimulatorStore = <T>(selector: (state: SimulatorState) => T) => {
//   return useSimulatorStore(useShallow(selector));
// };
