import type { Simulation, SimulationChunk, SimulationMember } from "@Src/types";
import type { SimulatorState } from "./simulator-slice.types";
import { current } from "@reduxjs/toolkit";

export function _logStore(object: any) {
  try {
    console.log(current(object));
  } catch {
    console.log(object);
  }
}

/**
 * @param id default to activeId
 */
export function getSimulation(state: SimulatorState, id: number | string = state.activeId): Simulation | null {
  const simulation = id ? state.simulations.find((simulation) => simulation.id === id) : undefined;
  return simulation ?? null;
}

export function fillAssembledMembers(members: (SimulationMember | null)[]) {
  return Array.from({ length: 4 }, (_, i) => members[i] ?? null);
}

export function getNextEventId(chunks: SimulationChunk[]) {
  let id = 0;

  for (let chunkI = 0; chunkI < chunks.length; chunkI++) {
    const events = chunks[chunkI].events;

    for (let eventI = 0; eventI < events.length; eventI++) {
      id = events[eventI].id;

      const nextEvent = events[eventI + 1] ?? chunks[chunkI + 1]?.events[0];

      if (!nextEvent || nextEvent.id !== id + 1) {
        return id + 1;
      }
    }
  }
  return id;
}
