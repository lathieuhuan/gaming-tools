import type { Simulation, SimulationChunk, SimulationEvent, SimulationMember } from "@Src/types";
import type { SimulatorState } from "./simulator-slice.types";
import { uuid } from "@Src/utils";

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

      if (!nextEvent || nextEvent.id !== id + 1) {
        return id + 1;
      }
    }
  }
  return id;
}

export function _addEvent(
  chunks: SimulationChunk[],
  /** Switch on field member action should have no event */
  event: SimulationEvent | null,
  performerCode: number,
  alsoSwitch: boolean
) {
  const lastChunk = chunks[chunks.length - 1];

  if (alsoSwitch && lastChunk.ownerCode !== performerCode) {
    let removedId: string | undefined;
    
    if (!lastChunk.events.length) {
      // Reuse id of removed empty chunk
      removedId = chunks.pop()?.id;
    }
    const newLastChunk = chunks[chunks.length - 1];

    /**
     * newLastChunk is undefined at the start,
     * the default first chunk has no events so it got removed by pop()
     */
    if (!newLastChunk || newLastChunk.ownerCode !== performerCode) {
      chunks.push({
        id: removedId ?? uuid(),
        ownerCode: performerCode,
        events: event ? [event] : [],
      });
    } else if (event) {
      newLastChunk.events.push(event);
    }
  } else if (event) {
    lastChunk.events.push(event);
  }
}
