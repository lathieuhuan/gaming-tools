import { PartiallyRequiredOnly } from "rond";

import {
  createCharacterCalc,
  createTarget,
  createWeapon,
  CreateWeaponParams,
} from "@/logic/entity.logic";
import { ArtifactGear, Target, Team } from "@/models";
import { TargetCalc } from "@/models/TargetCalc";
import { $AppCharacter } from "@/services";
import { ICharacterBasic } from "@/types";
import IdStore from "@/utils/IdStore";
import { createMemberInputs } from "../actions/utils";
import { MemberCalc } from "../logic/MemberCalc";
import { SimulationProcessor } from "../logic/SimulationProcessor";
import { Simulation, SimulationInputs } from "../types";

export type MemberConfig = PartiallyRequiredOnly<ICharacterBasic, "code"> & {
  weapon?: CreateWeaponParams;
};

const idStore = new IdStore();

export function createSimulation1(memberConfigs: MemberConfig[]): Simulation {
  const team = new Team();
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);

  const memberOrder: number[] = [];
  const members: Record<number, MemberCalc> = {};
  const memberList: MemberCalc[] = [];
  const inputs: SimulationInputs = {};

  for (const config of memberConfigs) {
    const data = $AppCharacter.get(config.code);
    const weapon = createWeapon(config.weapon || { type: data.weaponType }, undefined, idStore);

    const character = createCharacterCalc(
      {
        ...config,
        weapon,
        atfGear: new ArtifactGear(),
      },
      data,
      team
    );

    const member = new MemberCalc(character, data, team);

    memberOrder.push(config.code);
    memberList.push(member);
    members[config.code] = member;

    inputs[config.code] = createMemberInputs(member);
  }

  team.updateMembers(memberList);

  const simulation: Simulation = {
    id: idStore.gen(),
    activeMember: memberOrder[0],
    memberOrder,
    timeline: [],
    members,
    inputs,
    target,
    processor: new SimulationProcessor(members, target, memberOrder[0]),
  };

  return simulation;
}
