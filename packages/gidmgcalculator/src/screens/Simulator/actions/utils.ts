import { WritableDraft } from "immer/src/internal.js";

import type { Member } from "../models/Member";
import type { InputsById, MemberInputs, Simulation, SimulationInputs } from "../types";

import { createTarget } from "@/logic/entity.logic";
import { createModCtrlInputs } from "@/logic/modifier.logic";
import { Target } from "@/models/Target";
import { TargetCalc } from "@/models/TargetCalc";
import { SimulationProcessor } from "../models/SimulationProcessor";
import { selectSimulation, SimulatorState, useSimulatorStore } from "../store";

export function createSimulation(id: number = Date.now()) {
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);

  const newSimulation: Simulation = {
    id,
    memberOrder: [],
    members: new Map(),
    activeMember: 0,
    inputs: {},
    target,
    timeline: [],
    processor: new SimulationProcessor(new Map(), target, 0),
  };

  return newSimulation;
}

export function createMemberInputs(member: WritableDraft<Member>): MemberInputs {
  const abilityBuffInputs: InputsById = {};
  const weaponBuffInputs: InputsById = {};
  const artifactBuffInputs: InputsById = {};

  member.data.buffs?.forEach((buff) => {
    abilityBuffInputs[buff.id] = createModCtrlInputs(buff.inputConfigs, true);
  });

  member.weapon.data.buffs?.forEach((buff) => {
    weaponBuffInputs[buff.id] = createModCtrlInputs(buff.inputConfigs, true);
  });

  member.atfGear.sets.forEach((set) => {
    set.data.buffs?.forEach((buff) => {
      const id = set.bonusLv * 1000 + buff.id;

      artifactBuffInputs[id] = createModCtrlInputs(buff.inputConfigs, true);
    });
  });

  return {
    ABILITY_BUFF: abilityBuffInputs,
    WEAPON_BUFF: weaponBuffInputs,
    ARTIFACT_BUFF: artifactBuffInputs,
  };
}

export function resetSimulation(simulation: WritableDraft<Simulation>) {
  const { memberOrder } = simulation;
  const target = simulation.target.clone();

  const members = new Map<number, Member>();
  const inputs: SimulationInputs = {};

  for (const member of simulation.members.values()) {
    members.set(member.code, member.clone());
    inputs[member.code] = createMemberInputs(member);
  }

  simulation.members = members;
  simulation.activeMember = memberOrder[0];
  simulation.target = target;
  simulation.inputs = inputs;
  simulation.timeline = [];
  simulation.processor = new SimulationProcessor(members, target, memberOrder[0]);
}

/** Return true to process timeline */
type ActionToActiveSimulation = (simulation: WritableDraft<Simulation>) => boolean | void;

export function onActiveSimulation(action: ActionToActiveSimulation) {
  return (state: WritableDraft<SimulatorState>) => {
    const { activeId, simulationsById } = state;
    const simulation = simulationsById[activeId];

    if (simulation) {
      const shouldProcessTimeline = action(simulation);

      if (shouldProcessTimeline) {
        simulation.processor.runTimeline(simulation.timeline);
      }
    }
  };
}

export function updateActiveSimulation(action: ActionToActiveSimulation) {
  useSimulatorStore.setState(onActiveSimulation(action));
}

export function updateMember(code: number, callback: (member: Member) => Member) {
  const members = selectSimulation(useSimulatorStore.getState()).members;
  const member = members.get(code);

  if (!member) {
    return;
  }

  updateActiveSimulation((simulation) => {
    simulation.members.set(code, callback(member));
  });
}
