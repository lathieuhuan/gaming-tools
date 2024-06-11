import { Simulation, SimulationMember } from "@Src/types";
import { SimulatorState } from "./simulator-slice.types";

/**
 * @param id default to activeId
 */
export const getSimulation = (state: SimulatorState, id: number | string = state.activeId): Simulation | null => {
  return state.simulationsById[id] ?? null;
};

/**
 * @param memberName default to activeMember
 */
export const getMember = (state: SimulatorState, memberName = state.activeMember): SimulationMember | null => {
  return getSimulation(state)?.members?.find((member) => member.name === memberName) ?? null;
};
