import { createTarget, createWeapon, CreateWeaponRawData } from "@/logic/entity.logic";
import { Target, TargetCalc } from "@/models";
import { Member } from "@/screens/Simulator/models/Member";
import { $AppCharacter } from "@/services";
import { CharacterStateData } from "@/types";
import IdStore from "@/utils/IdStore";
import { createMemberInputs, createTeamInputs } from "../actions/utils";
import { SimulationProcessor } from "../models/SimulationProcessor";
import { Simulation, SimulationMemberInputs } from "../types";

export type MemberConfig = Partial<CharacterStateData> & {
  code: number;
  weapon?: CreateWeaponRawData;
};

const idStore = new IdStore();

export function createSimulationMock(memberConfigs: MemberConfig[]): Simulation {
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);

  const memberOrder: number[] = [];
  const members: Map<number, Member> = new Map();
  const memberInputs: SimulationMemberInputs = {};

  for (const config of memberConfigs) {
    const data = $AppCharacter.get(config.code);

    const weaponRaw = config.weapon || { type: data.weaponType };
    const weapon = createWeapon({ ...weaponRaw, ID: idStore.gen() });

    const member = new Member(config.code, data, weapon, { state: config });

    memberOrder.push(config.code);
    members.set(config.code, member);
    memberInputs[config.code] = createMemberInputs(member);
  }

  const simulation: Simulation = {
    id: idStore.gen(),
    activeMember: memberOrder[0],
    memberOrder,
    timeline: [],
    members,
    memberInputs,
    teamInputs: createTeamInputs(members),
    target,
    processor: new SimulationProcessor(members, target, memberOrder[0]),
  };

  return simulation;
}
