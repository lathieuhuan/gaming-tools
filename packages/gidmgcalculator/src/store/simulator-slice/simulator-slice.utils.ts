import type { Simulation, SimulationChunk, SimulationMember } from "@Src/types";
import type { SimulatorState } from "./simulator-slice.types";

/**
 * @param id default to activeId
 */
export function getSimulation(state: SimulatorState, id: number | string = state.activeId): Simulation | null {
  return state.simulationsById[id] ?? null;
}

/**
 * @param memberName default to activeMember
 */
export function getMember(state: SimulatorState, memberName = state.activeMember): SimulationMember | null {
  return getSimulation(state)?.members?.find((member) => member.name === memberName) ?? null;
}

export function getNextEventId(chunks: SimulationChunk[]) {
  let id = 0;

  for (let chunkI = 0; chunkI < chunks.length; chunkI++) {
    const events = chunks[chunkI].events;

    for (let eventI = 0; eventI < events.length; eventI++) {
      id = events[eventI].id;

      const nextEvent = events[eventI + 1] ?? chunks[chunkI + 1]?.events[0];

      if (!nextEvent || nextEvent.id !== id) {
        return id;
      }
    }
  }
  return id;
}
