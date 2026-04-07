import { WritableDraft } from "immer/src/internal.js";

import type {
  InputsById,
  MemberInputs,
  Simulation,
  SimulationInputs,
  SimulationMembers,
} from "../types";

import { createTarget } from "@/logic/entity.logic";
import { Character, Target } from "@/models";
import { TargetCalc } from "@/models/TargetCalc";
import { SimulationProcessor } from "../logic/SimulationProcessor";
import { SimulatorState, useSimulatorStore } from "../store";
import { createModCtrlInputs } from "@/logic/modifier.logic";

export function createSimulation(id: number = Date.now()) {
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);
  const newSimulation: Simulation = {
    id,
    memberOrder: [],
    members: {},
    activeMember: 0,
    inputs: {},
    target,
    timeline: [],
    processor: new SimulationProcessor({}, target, 0),
  };

  return newSimulation;
}

export function createMemberInputs(member: Character): MemberInputs {
  const abilityBuffInputs: InputsById = {};

  member.data.buffs?.forEach((buff) => {
    abilityBuffInputs[buff.index] = createModCtrlInputs(buff.inputConfigs);
  });

  return {
    ABILITY_BUFF: abilityBuffInputs,
    WEAPON_BUFF: {},
  };
}

export function resetSimulation(simulation: WritableDraft<Simulation>) {
  const { memberOrder, members } = simulation;

  const target = simulation.target.clone();
  const newMembers: SimulationMembers = {};
  const newMemberClones: SimulationMembers = {};
  const newInputs: SimulationInputs = {};

  memberOrder.forEach((code) => {
    const member = members[code].initCalculation();

    newMembers[code] = member.clone();
    newMemberClones[code] = member.deepClone();
    newInputs[code] = createMemberInputs(member);
  });

  simulation.members = newMembers;
  simulation.activeMember = memberOrder[0];
  simulation.inputs = newInputs;
  simulation.timeline = [];
  simulation.processor = new SimulationProcessor(newMemberClones, target, memberOrder[0]);
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
