import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { ArtifactType } from "@/types";
import type { ModCategory, Simulation } from "./types";

export type SimulationManager = {
  id: number;
  name: string;
};

export type SimulatorPhase = "PREP" | "BUILD";

type AssemblingModalType =
  | "TAVERN"
  | "REMOVE_MEMBER"
  | "WEAPON_FORGE"
  | "WEAPON_INVENTORY"
  | "ARTIFACT_FORGE"
  | "ARTIFACT_INVENTORY"
  | "";

export type AssemblingModalState = {
  type: AssemblingModalType;
  slot: number;
  artifactType?: ArtifactType;
};

export type SimulatorState = {
  sidebarOpen: boolean;
  phase: SimulatorPhase;
  assemblingModal: AssemblingModalState;
  managers: SimulationManager[];
  activeId: number;
  simulationsById: Record<string, Simulation>;
};

const initialState: SimulatorState = {
  sidebarOpen: false,
  phase: "PREP",
  assemblingModal: {
    type: "",
    slot: -1,
  },
  managers: [],
  activeId: 0,
  simulationsById: {},
};

export const useSimulatorStore = create<SimulatorState>()(immer(() => initialState));

export const selectSimulation = (state: SimulatorState, id = state.activeId) =>
  state.simulationsById[id];

export const selectActiveMember = (state: SimulatorState) => {
  const {
    activeMember,
    memberOrder,
    processor: { team },
  } = selectSimulation(state);

  return team.hasMember(activeMember)
    ? team.getMember(activeMember)
    : team.getMember(memberOrder[0]);
};

export const selectProcessor = (state: SimulatorState, id?: number) => {
  return selectSimulation(state, id).processor;
};

export const selectMemberInputs = (category: ModCategory) => (state: SimulatorState) => {
  const simulation = selectSimulation(state);

  return simulation.memberInputs[simulation.activeMember][category];
};

// export const useShallowSimulatorStore = <T>(selector: (state: SimulatorState) => T) => {
//   return useSimulatorStore(useShallow(selector));
// };
