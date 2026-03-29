import type { ExactOmit } from "rond";

import type { AbilityBuffEvent, AbilityHitEvent, ModCategory } from "../types";

import { useSimulatorStore } from "../store";
import { resetSimulation, updateActiveSimulation } from "./utils";

export function startBuilding(simulationId?: number) {
  useSimulatorStore.setState((state) => {
    const id = simulationId ?? state.activeId;
    const simulation = state.simulationsById[id];

    if (!simulation) {
      return;
    }

    resetSimulation(simulation);

    state.activeId = id;
    state.phase = "BUILD";
  });
}

export function restart() {
  updateActiveSimulation((simulation) => {
    resetSimulation(simulation);
  });
}

// ===== OPERATIONS =====

export function selectMember(code: number) {
  updateActiveSimulation((simulation) => {
    simulation.activeMember = code;
  });
}

export function updateAbilityInputs(
  category: ModCategory,
  modId: number,
  inputsOrSetter: number[] | ((inputs: number[]) => number[])
) {
  updateActiveSimulation((simulation) => {
    const cateInputs = simulation.inputs[simulation.activeMember][category];
    const inputs = cateInputs[modId] || [];
    const newInputs =
      typeof inputsOrSetter === "function" ? inputsOrSetter(inputs) : inputsOrSetter;

    cateInputs[modId] = newInputs;
  });
}

// ===== EVENT =====

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

export function triggerAbilityHitEvent(event: ExactOmit<AbilityHitEvent, "id" | "cate" | "type">) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: "C",
      type: "AH",
    });

    simulation.processor.processTimeline(simulation.timeline);
  });
}

export function triggerAbilityBuffEvent(
  event: ExactOmit<AbilityBuffEvent, "id" | "cate" | "type">
) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: "C",
      type: "AB",
    });

    simulation.processor.processTimeline(simulation.timeline);
  });
}
