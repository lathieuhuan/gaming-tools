import { ExactOmit } from "rond";

import type { WritableDraft } from "immer/src/internal.js";
import type { EventsByMember, Simulation, TalentHitEvent } from "../types";

import { useSimulatorStore } from "../store";
import { initSimulation, updateActiveSimulation } from "./utils";

export function startBuilding() {
  useSimulatorStore.setState((state) => {
    const simulation: WritableDraft<Simulation> = {
      ...initSimulation(state.activeId),
      ...state.simulationsById[state.activeId],
    };
    const { memberOrder } = simulation;
    const eventsByMember: EventsByMember = {};

    memberOrder.forEach((code) => {
      const member = simulation.members[code];

      eventsByMember[code] = {};
      member.initCalc();
    });

    simulation.eventsByMember = eventsByMember;
    simulation.onFieldMember = memberOrder[0];
    simulation.activeMember = memberOrder[0];

    state.step = "BUILD";
  });
}

export function selectMember(code: number) {
  updateActiveSimulation((simulation) => {
    simulation.activeMember = code;
  });
}

let eventId = 1;

export function triggerTalentHitEvent(event: ExactOmit<TalentHitEvent, "id" | "type" | "subType">) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.eventsByMember[event.performer][id] = {
      ...event,
      id,
      type: "H",
      subType: "Th",
    };
    simulation.timeline.push({
      performer: { type: "M", code: event.performer },
      id,
    });
  });
}
