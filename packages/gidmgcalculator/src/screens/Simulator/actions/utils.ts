import { WritableDraft } from "immer/src/internal.js";

import type { Simulation } from "../types";
import { SimulatorState, useSimulatorStore } from "../store";

export function initSimulation(id: number = Date.now()) {
  const newSimulation: Simulation = {
    id,
    memberOrder: [],
    members: {},
    eventsByMember: {},
    timeline: [],
    onFieldMember: 0,
    activeMember: 0,
    summary: {
      totalDamage: 0,
    },
  };

  return newSimulation;
}

export function onActiveSimulation(
  callback: (simulation: WritableDraft<Simulation>) => boolean | void
) {
  return (state: WritableDraft<SimulatorState>) => {
    const { activeId, simulationsById } = state;
    const simulation = simulationsById[activeId];

    if (simulation) {
      const shouldCalculate = callback(simulation) ?? true;

      // if (shouldCalculate) {
      //   state.simulationsById[activeId] = simulation.calculate();
      // }
    }
  };
}

export function updateActiveSimulation(
  callback: (simulation: WritableDraft<Simulation>) => boolean | void
) {
  useSimulatorStore.setState(onActiveSimulation(callback));
}
