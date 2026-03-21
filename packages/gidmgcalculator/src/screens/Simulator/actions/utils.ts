import { WritableDraft } from "immer/src/internal.js";

import type { Simulation } from "../types";

import { createTarget } from "@/logic/entity.logic";
import { Target } from "@/models";
import { TargetCalc } from "@/models/TargetCalc";
import { SimulationProcessor } from "../logic/SimulationProcessor";
import { SimulatorState, useSimulatorStore } from "../store";

export function createSimulation(id: number = Date.now()) {
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);
  const newSimulation: Simulation = {
    id,
    memberOrder: [],
    members: {},
    activeMember: 0,
    target,
    timeline: [],
    processor: new SimulationProcessor({}, target, 0),
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
      callback(simulation);
    }
  };
}

export function updateActiveSimulation(
  callback: (simulation: WritableDraft<Simulation>) => boolean | void
) {
  useSimulatorStore.setState(onActiveSimulation(callback));
}
