import { WritableDraft } from "immer/src/internal.js";

import type { TalentLevelBonus } from "@/types";
import type { Member } from "../models/Member";
import type { InputsById, MemberInputs, Simulation, SimulationInputs } from "../types";

import { createTarget } from "@/logic/entity.logic";
import { createModCtrlInputs } from "@/logic/modifier.logic";
import { Target } from "@/models/Target";
import { TargetCalc } from "@/models/TargetCalc";
import { SimulationProcessor } from "../models/SimulationProcessor";
import { TeamState } from "../models/Team";
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

  member.data.buffs?.forEach((buff) => {
    abilityBuffInputs[buff.index] = createModCtrlInputs(buff.inputConfigs);
  });

  return {
    ABILITY_BUFF: abilityBuffInputs,
    WEAPON_BUFF: {},
  };
}

export function resetSimulation(simulation: WritableDraft<Simulation>) {
  const { memberOrder } = simulation;
  const target = simulation.target.clone();

  const members = new Map<number, Member>();
  const memberClones = new Map<number, Member>();
  const inputs: SimulationInputs = {};

  for (const member of simulation.members.values()) {
    members.set(member.code, member.clone());
    inputs[member.code] = createMemberInputs(member);
  }

  const levelBonuses: TalentLevelBonus[] = [];
  const teamState = new TeamState(members);

  if (members.has(26)) {
    // "Tartaglia"
    levelBonuses.push({
      id: "c26",
      toType: "NAs",
      value: 1,
      label: "Tartaglia",
    });
  }

  if (members.has(105)) {
    // "Skirk"
    const isValid = teamState.isTeamElmtValid({
      teamOnlyElmts: ["hydro", "cryo"],
      teamEachElmtCount: { hydro: 1, cryo: 1 },
    });

    if (isValid) {
      levelBonuses.push({
        id: "c105",
        toType: "ES",
        value: 1,
        label: "Skirk",
      });
    }
  }

  members.forEach((member) => {
    member
      .initCalculation({
        resonanceElmts: teamState.resonances,
        levelBonuses,
      })
      .attrsCtrl.finalize();

    memberClones.set(member.code, member.deepClone());
  });

  simulation.members = members;
  simulation.activeMember = memberOrder[0];
  simulation.inputs = inputs;
  simulation.timeline = [];
  simulation.processor = new SimulationProcessor(memberClones, target, memberOrder[0]);
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
        simulation.processor.processTimeline(simulation.timeline, simulation.members);
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
