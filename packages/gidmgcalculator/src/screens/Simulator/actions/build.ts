import type { ExactOmit } from "rond";

import type {
  ModCategory,
  RawAbilityBuffEvent,
  RawAbilityHitEvent,
  RawArtifactBuffEvent,
  RawWeaponBuffEvent,
} from "../types";

import { EEventCategory, EHitEventType, EModifyEventType } from "../configs";
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
      cate: EEventCategory.MEMBER,
      type: "SI",
      performer: code,
    });

    return true;
  });
}

export function triggerAbilityHitEvent(
  event: ExactOmit<RawAbilityHitEvent, "id" | "cate" | "type">
) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: EEventCategory.MEMBER,
      type: EHitEventType.ABILITY_HIT,
    });

    return true;
  });
}

export function triggerAbilityBuffEvent(
  event: ExactOmit<RawAbilityBuffEvent, "id" | "cate" | "type">
) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: EEventCategory.MEMBER,
      type: EModifyEventType.ABILITY_BUFF,
    });

    return true;
  });
}

export function triggerWeaponBuffEvent(
  event: ExactOmit<RawWeaponBuffEvent, "id" | "cate" | "type">
) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: EEventCategory.MEMBER,
      type: EModifyEventType.WEAPON_BUFF,
    });

    return true;
  });
}

export function triggerArtifactBuffEvent(
  event: ExactOmit<RawArtifactBuffEvent, "id" | "cate" | "type">
) {
  updateActiveSimulation((simulation) => {
    const id = `${eventId++}`;

    simulation.timeline.push({
      ...event,
      id,
      cate: EEventCategory.MEMBER,
      type: EModifyEventType.ARTIFACT_SET_BUFF,
    });

    return true;
  });
}
