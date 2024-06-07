import { Simulation, SimulationMember } from "@Src/types";
import { SimulatorState } from "./simulator-slice.types";

export const getActiveSimulation = (state: SimulatorState): Simulation | null => {
  return state.simulationsById[state.activeId] ?? null;
};

/**
 * @param memberName default to activeMember
 */
export const getMember = (state: SimulatorState, memberName = state.activeMember): SimulationMember | null => {
  return state.simulationsById[state.activeId]?.members?.find((member) => member.name === memberName) ?? null;
};
