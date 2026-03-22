import { ExactOmit } from "rond";

import type { SimulationMembers, TalentHitEvent } from "../types";

import { SimulationProcessor } from "../logic/SimulationProcessor";
import { useSimulatorStore } from "../store";
import { updateActiveSimulation } from "./utils";

export function startBuilding() {
  useSimulatorStore.setState((state) => {
    const simulation = state.simulationsById[state.activeId];
    const { memberOrder, members } = simulation;

    const target = simulation.target.clone();
    const newMembers: SimulationMembers = {};
    const newMemberClones: SimulationMembers = {};

    memberOrder.forEach((code) => {
      const member = members[code].initCalc();

      newMembers[code] = member.clone();
      newMemberClones[code] = member.deepClone();
    });

    simulation.members = newMembers;
    simulation.activeMember = memberOrder[0];
    simulation.timeline = [];
    simulation.processor = new SimulationProcessor(newMemberClones, target, memberOrder[0]);

    state.simulationsById[state.activeId] = simulation;
    state.phase = "BUILD";
  });
}

export function selectMember(code: number) {
  updateActiveSimulation((simulation) => {
    simulation.activeMember = code;
  });
}

let eventId = 1;

export function switchIn(code: number) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      id,
      cate: "C",
      type: "SI",
      performer: code,
    });

    simulation.processor.processTimeline(simulation.timeline);
  });
}

export function triggerTalentHitEvent(event: ExactOmit<TalentHitEvent, "id" | "cate" | "type">) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: "C",
      type: "TH",
    });

    simulation.processor.processTimeline(simulation.timeline);
  });
}
